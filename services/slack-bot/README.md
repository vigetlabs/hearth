# slack-bot

Sends a weekly "here's your schedule for next week" DM to a group of Slack
users, with an **Update Schedule** button that links to the schedule editor.

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

The **Signing Secret** is only needed for the optional interactivity endpoint
(see the bottom of this file); the three DM triggers just need the bot token.

## Configuration

```bash
cp .env.example .env   # then fill in the values
npm install
```

| Var | Needed by | Notes |
| --- | --- | --- |
| `SLACK_BOT_TOKEN` | all sends | `xoxb-…`, from step 3 above |
| `SLACK_USERGROUP_ID` | `schedule`, `send-now` | the user group whose active members get the DM (`S…`) |
| `USE_SLACK` | all sends | must be `true` to actually deliver; `false` makes every send a no-op (safe for dev) |
| `DEMO_USER_ID` | `send-demo` | optional default recipient for the demo |
| `SLACK_SIGNING_SECRET` | interactivity endpoint only | from step 4; not needed for the DM triggers |
| `PORT` | interactivity endpoint only | defaults to `3000` |

> If `npm run …` can't find `node` (a Windows PATH quirk in some shells), run the
> underlying command directly, e.g. `node --env-file=.env src/send_now.ts`.

## Architecture

Each piece is small and testable in isolation:

| File | Role |
| --- | --- |
| `src/config.ts` | Reads + validates env (`node --env-file=.env` loads it) |
| `src/slack_service.ts` | Wrapper over `@slack/web-api`. Resolves the user group and filters to active accounts. Ships a `FakeSlackService` for tests |
| `src/slack_messenger.ts` | Outbound Block Kit messages (DM + channel), gated by the `USE_SLACK` kill-switch |
| `src/prompt.ts` | Builds the weekly message (schedule + Update Schedule button). Mock schedule data lives here |
| `src/send_prompt.ts` | Shared runner: resolve group → filter active → DM each. Used by both `schedule` and `send-now` |
| `src/scheduler.ts` | Friday cron entry point (`schedule`) |
| `src/send_now.ts` | Manual group-send entry point (`send-now`) |
| `src/send-demo.ts` | Single-user entry point (`send-demo`) |
| `src/verify.ts` + `src/server.ts` | Optional interactivity endpoint (signature verification + action routing) |

**Recipient filtering.** `SLACK_USERGROUP_ID` is the subset selector, maintained
in Slack itself. At send time the bot resolves the group live and drops any
member whose account is deactivated, a bot, or a guest (`deleted` / `is_bot` /
`is_restricted`) — so the list is always current without a database.

## The three DM triggers

All three send the **same** message (built by `src/prompt.ts`). They differ only
in *when* they fire and *who* receives it.

### 1. `npm run schedule` — automatic, weekly

Starts a long-running process that DMs every active member of
`SLACK_USERGROUP_ID` **every Friday at 12:00 noon Eastern**
(`America/New_York`, so EST/EDT is handled automatically).

```bash
npm run schedule
# Scheduler started (Fridays 12:00 America/New_York). Next run: 2026-07-10T12:00:00-04:00. Ctrl+C to stop.
```

This is the production cadence. It only fires while the process is running — if
the machine sleeps or the process dies, that Friday is missed. For real
deployments back it with a system cron / restarting container / hosted scheduler.

### 2. `npm run send-now` — manual, same recipients

Fires the **exact same group send** as the scheduler, immediately — for testing
without waiting until Friday.

```bash
npm run send-now
# Sent to 4/4 active group member(s).
#   U0AAA: ok
#   U0BBB: ok
```

### 3. `npm run send-demo -- <SLACK_USER_ID>` — manual, single user

DMs **one** person (usually yourself) and ignores the user group entirely. The
quickest smoke test that tokens and message rendering work.

```bash
npm run send-demo -- U0XXXXXXX
# or, with DEMO_USER_ID set in .env:
npm run send-demo
```

### Which one do I want?

| Goal | Use |
| --- | --- |
| The real weekly Friday DM | `schedule` |
| Send the weekly DM to the group right now | `send-now` |
| Check my setup by DMing just myself | `send-demo` |

## The Update Schedule button & interactivity

The button in the DM is a **link** to the schedule editor
(`SCHEDULE_EDITOR_URL` in `src/prompt.ts`, currently `https://example.com`).
Clicking opens that URL in the browser — Slack handles this client-side, so the
three DM triggers are fully functional on their own.

`src/server.ts` is a separate, **optional** interactivity endpoint. It only
matters if you later replace the link with in-DM editing (modals, in-place
schedule updates). That path needs a publicly reachable **Request URL** (set
under **Interactivity & Shortcuts**; tunnel with `ngrok http 3000` in dev),
`SLACK_SIGNING_SECRET` for request verification, and a response within Slack's
3-second window. None of it is required for the current link-button funnel.

```bash
npm start   # runs the interactivity endpoint on PORT (default 3000)
```
