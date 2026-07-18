# slack-bot

Sends a weekly "here's your schedule for next week" DM to a group of Slack
users, with an **Edit Schedule** button that opens an in-DM modal for editing
next week's work locations.

Runs on Node 24's native TypeScript support — no build step, no compiler.

## Slack app setup

1. Create an app at <https://api.slack.com/apps> → **From scratch**, and pick
   your workspace. (One app per environment is a good pattern.)
2. **OAuth & Permissions → Bot Token Scopes**, add:
   `chat:write`, `im:write`, `users:read`, `usergroups:read`.
3. Click **Install to Workspace** and authorize. Copy the **Bot User OAuth
   Token** (`xoxb-…`) from the top of that page.
4. **Basic Information → App Credentials**, copy the **Signing Secret**.
5. Create (or pick) a Slack **user group** — its active members are who the
   weekly DM goes to. Grab its ID (`S…`) from the group's URL or via
   `usergroups.list`.

The **Signing Secret** is needed to run the server (it verifies inbound
interactivity requests — see the bottom of this file); the one-off `send-now`
just needs the bot token.

## Configuration

```bash
cp .env.example .env   # then fill in the values
npm install
```

| Var | Needed by | Notes |
| --- | --- | --- |
| `SLACK_BOT_TOKEN` | all sends | `xoxb-…`, from step 3 above |
| `SLACK_USERGROUP_ID` | weekly send, `send-now` | the user group whose active members get the DM (`S…`) |
| `USE_SLACK` | all sends | must be `true` to actually deliver; `false` makes every send a no-op (safe for dev) |
| `SLACK_SIGNING_SECRET` | `npm start` (interactivity) | from step 4; not needed for `send-now` |
| `PORT` | `npm start` (interactivity) | defaults to `3000` |

> If `npm run …` can't find `node` (a Windows PATH quirk in some shells), run the
> underlying command directly, e.g. `node --env-file=.env src/bin/send-now.ts`.

## Architecture

Files are grouped by role, split along dependency direction: `src/slack/` is the
only folder that touches `@slack/web-api`, `src/schedule/` and `src/views/` are
pure and network-free, and `src/bin/` is thin wiring. Each piece is small and
testable in isolation:

| File | Role |
| --- | --- |
| `src/config.ts` | Reads + validates env (`node --env-file=.env` loads it) |
| `src/slack/client.ts` | Wrapper over `@slack/web-api`. Resolves the user group and filters to active accounts. Ships a `FakeSlackService` for tests |
| `src/slack/messenger.ts` | Outbound Block Kit messages (DM + channel), gated by the `USE_SLACK` kill-switch |
| `src/slack/verify.ts` | Verifies Slack's request signature on the interactivity endpoint |
| `src/schedule/store.ts` | Schedule domain types + persistence seam. In-memory `InMemoryScheduleStore` today; swap for a Rails-backed store later |
| `src/views/prompt.ts` | Builds the weekly message (schedule + Edit Schedule button). Mock display data lives here |
| `src/views/modal.ts` | Builds the Edit Schedule modal from a week and parses a submission back into one |
| `src/send-prompt.ts` | Shared runner: resolve group → filter active → DM each. Used by both the weekly timer and `send-now` |
| `src/bin/send-now.ts` | The group-send entry point. Fired weekly by a system timer in prod (`deploy/`), and by hand for testing |
| `src/bin/server.ts` | The interactivity endpoint: acks + dispatches interactions, opens the modal, persists submissions. Long-running; does **not** schedule anything |
| `deploy/` | systemd units for EC2: a service for the interactivity endpoint, plus a `oneshot` + timer that runs `send-now` every Friday |

**Recipient filtering.** `SLACK_USERGROUP_ID` is the subset selector, maintained
in Slack itself. At send time the bot resolves the group live and drops any
member whose account is deactivated, a bot, or a guest (`deleted` / `is_bot` /
`is_restricted`) — so the list is always current without a database.

## The weekly send

The weekly DM is a **one-shot** (`src/bin/send-now.ts`), not a daemon. It
resolves the recipient pool live, DMs each active member the prompt, and exits.
The same command is used two ways:

### In production — a system timer runs it every Friday

On EC2 a **systemd timer** (`deploy/slack-bot-weekly.timer`) invokes `send-now`
**every Friday at 12:00 noon Eastern** (`America/New_York`, so EST/EDT is handled
automatically). Nothing has to stay alive between Fridays, and because the timer
lives in the OS — not in a Node process — a reboot or a crash of the
interactivity server can't cause a missed send. See **Deploying on EC2** below.

### For testing — run it by hand

Fires the **exact same group send**, immediately, from your shell — for checking
setup without waiting until Friday or standing anything up.

```bash
npm run send-now
# Sent to 4/4 active group member(s).
#   U0AAA: ok
#   U0BBB: ok
```

## Deploying on EC2

Two independent units, so the once-a-week send never depends on the server
staying up:

| Unit | Type | Role |
| --- | --- | --- |
| `slack-bot-server.service` | long-running | the interactivity endpoint (`server.ts`), restarts on failure |
| `slack-bot-weekly.timer` → `slack-bot-weekly.service` | timer + `oneshot` | runs `send-now` every Friday 12:00 ET |

```bash
# On the instance, from the deployed app dir (e.g. /opt/slack-bot):
sudo cp deploy/slack-bot-*.service deploy/slack-bot-weekly.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now slack-bot-server.service   # interactivity endpoint
sudo systemctl enable --now slack-bot-weekly.timer     # weekly send
systemctl list-timers slack-bot-weekly.timer           # confirm next run
```

Each unit uses `WorkingDirectory=/opt/slack-bot` and `node --env-file=.env …`, so
the `.env` (bot token, signing secret, etc.) lives next to the code just like in
dev. Edit `User`, `WorkingDirectory`, and the absolute `node` path in the units
to match the host before installing — the headers in each file say what to set.

The `OnCalendar` timezone suffix needs systemd ≥ 252 (Amazon Linux 2023 is fine).
On older systemd, drop the suffix and either set the host clock to
`America/New_York` or use a cron entry with `CRON_TZ=America/New_York 0 12 * * 5`
calling the same `node --env-file=.env src/bin/send-now.ts`.

### Which one do I want?

| Goal | Use |
| --- | --- |
| Run the interactivity endpoint locally | `npm start` |
| Send the weekly DM to the group right now (e.g. to check setup) | `npm run send-now` |
| The real weekly Friday DM in prod | the `slack-bot-weekly.timer` above |

## The Edit Schedule button & interactivity

The **Edit Schedule** button opens a modal in Slack with one radio group per
weekday (Falls Church / Durham / Remote). On **Save**, the whole week is
persisted in a single write and **the original DM is rewritten in place** to
show the saved schedule (via `chat.update`). The modal carries the source
message's channel/ts in its `private_metadata` so the submit handler knows which
message to update; if that's ever missing it falls back to a fresh confirmation
DM.

This needs the server (`src/bin/server.ts`) running, because a non-link button
delivers its click to your app's **Request URL** — that POST is the only way the
press reaches your code. So unlike the one-off `send-now`, the button is **not**
self-contained: it requires

- a publicly reachable **Request URL** set under **Interactivity & Shortcuts**
  (tunnel with `ngrok http 3000` in dev), pointing at `/slack/handle-event`,
- `SLACK_SIGNING_SECRET` for request verification, and
- the server to ack within Slack's 3-second window (it does — it acks first,
  then opens the modal / saves).

```bash
npm start   # interactivity endpoint on PORT (default 3000)
```

### Where the data lives (and the API seam)

Schedules are currently held in memory by `InMemoryScheduleStore`
(`src/schedule/store.ts`) — restarting `npm start` resets everyone to the
default week. This is deliberate: it lets the full editing flow work with **no
backend**. When the Rails API is ready, add a `LiveScheduleStore` implementing
the same `ScheduleStore` interface (`getSchedule` / `setSchedule`) and swap the
one line in `src/bin/server.ts`. Because a modal submission hands back the entire week
at once, `setSchedule` maps to a **single** endpoint keyed by user id (body =
the whole week) — no per-day routes.
