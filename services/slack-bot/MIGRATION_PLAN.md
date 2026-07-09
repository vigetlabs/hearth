# Migration plan: retire the Node Slack service, move everything into Rails

**Status:** proposal · **Branch:** `sjb/57-remove-bot-node-server`

## Goal

Remove the standalone Node service in `services/slack-bot` and point Slack's
interactivity **Request URL** directly at the Rails API. All outbound sends
(the weekly DM) and all inbound interactions (button clicks, modal saves) are
handled by Rails. The `services/slack-bot` directory is deleted at the end.

## Why the whole service moves, not just `server.ts`

The bot does two independent jobs:

- **Outbound** — resolve recipients, build the weekly Block Kit DM, `chat.postMessage`.
  (`scheduler.ts`, `send_now.ts`, `send_prompt.ts`, `prompt.ts`, `slack_service.ts`, `slack_messenger.ts`)
- **Inbound** — the HTTP server Slack POSTs to on a button click / modal save; it
  verifies the signature, acks, then calls `views.open` / `chat.update`.
  (`server.ts`, `verify.ts`, `schedule_modal.ts`, `schedule_store.ts`)

Once Rails is Slack's Request URL it must (1) verify the Slack signature on the
raw body, (2) ack within 3 seconds, and (3) call the Slack Web API with the bot
token. As soon as Rails can do (3), a separate Node process for the outbound
send is pure duplication — the weekly send is also just "resolve users +
`chat.postMessage`," and both the outbound send and the confirm/edit re-render
build the **same** Block Kit message (`prompt.ts`). Splitting that builder across
Ruby and Node is the thing to avoid. So the clean end state deletes the whole
directory.

## File-by-file fate

| Node file | Fate | Rails equivalent |
| --- | --- | --- |
| `server.ts` | delete | `Api::V1::Slack::InteractionsController` |
| `verify.ts` | port to Ruby | `Slack::SignatureVerifier` (before_action / concern) |
| `prompt.ts` | port to Ruby | `Slack::PromptBuilder` |
| `schedule_modal.ts` | port to Ruby | `Slack::ScheduleModal` (build + parse) |
| `schedule_store.ts` | replace with real persistence | `Schedule` model + migration |
| `slack_service.ts` | port to Ruby | `Slack::Directory` (active-member filter) |
| `slack_messenger.ts` | port to Ruby | `Slack::Messenger` (+ `USE_SLACK` kill-switch) |
| `send_prompt.ts` | port to Ruby | `SendWeeklyPromptJob` |
| `scheduler.ts` (cron) | replace | recurring job (Solid Queue recurring task / cron) |
| `send_now.ts` | replace | rake task `slack:send_weekly` |
| `config.ts` | absorb | Rails credentials / ENV |
| `tests/*` | port | RSpec request + unit specs |
| `package.json`, `tsconfig.json`, `node_modules`, `.env`, `README.md` | delete | — |

What survives is **domain knowledge, re-expressed in Ruby**: the Block Kit
layouts, the active-member filter rules (`deleted` / `is_bot` / `is_restricted`,
the `vl@viget.com` and `slackbot` exclusions), the HMAC signature algorithm, and
the `WeekSchedule` shape.

## Two problems the current code doesn't hint at

1. **The 3-second ack needs a background queue.** Rails has the same 3s limit the
   Node server respects by acking first. The controller must verify → `head :ok`
   → enqueue a job that does the outbound Slack calls. The Gemfile has **no queue
   backend today** — add Solid Queue (Rails 8 default) or Sidekiq. Caveat:
   `views.open` needs the `trigger_id`, which expires in ~3s, so either keep a
   warm worker or open the modal inline in the request and background only the
   heavier work.

2. **Slack-id → User identity mapping.** Slack sends a Slack user id (`U123…`);
   the Rails `User` is a Devise account keyed by email, with **no `slack_user_id`
   column today** (see `db/schema.rb`). The in-memory store just keys by Slack id
   and never reconciles to a real account. Add a `slack_user_id` column and
   populate it (at signup, or by matching the email from `users.info`).

---

## Dependencies to add (`api/Gemfile`)

```ruby
gem "slack-ruby-client"          # or hand-rolled Net::HTTP; wraps the Web API
gem "solid_queue"                # background jobs + recurring tasks (Rails 8)
# gem "sidekiq"                  # alternative if Redis is preferred
```

Secrets (Rails credentials or ENV, mirroring the current `.env`):
`SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_USERGROUP_ID`, `USE_SLACK`,
`WEB_APP_URL`.

---

## Target Rails layout

```
api/app/
  controllers/api/v1/slack/interactions_controller.rb
  controllers/api/v1/schedules_controller.rb          # only if the React client needs it
  jobs/handle_slack_interaction_job.rb
  jobs/send_weekly_prompt_job.rb
  models/schedule.rb
  services/slack/client.rb                             # Web API wrapper (bot token)
  services/slack/signature_verifier.rb                 # port of verify.ts
  services/slack/directory.rb                          # port of slack_service.ts
  services/slack/messenger.rb                          # port of slack_messenger.ts
  services/slack/prompt_builder.rb                     # port of prompt.ts
  services/slack/schedule_modal.rb                     # port of schedule_modal.ts
  services/slack/week.rb                               # WeekSchedule domain + date helpers
lib/tasks/slack.rake                                   # send_now replacement
```

---

## Request & response shapes

### A. Inbound — Slack → Rails (the interactivity Request URL)

- **Route:** `POST /api/v1/slack/interactions`
- **Content-Type:** `application/x-www-form-urlencoded` (NOT JSON). One field
  `payload` holds URL-encoded JSON.
- **Headers:** `X-Slack-Request-Timestamp`, `X-Slack-Signature`.
- **Special citizen:** this controller **skips Devise/JWT auth** (authenticated by
  signature, not the `jwt_token` cookie) and **does not use the `{status, data}`
  ApiResponse envelope** — Slack defines the response contract.

**`block_actions`** (button click):

```json
{
  "type": "block_actions",
  "user": { "id": "U123" },
  "trigger_id": "1234.5678.abcd",
  "container": { "message_ts": "1699999999.000100" },
  "channel": { "id": "D0ABC" },
  "actions": [{ "action_id": "edit_schedule", "value": "weekly" }]
}
```

**`view_submission`** (modal Save):

```json
{
  "type": "view_submission",
  "user": { "id": "U123" },
  "view": {
    "callback_id": "schedule_modal",
    "private_metadata": "{\"channel\":\"D0ABC\",\"ts\":\"169...\",\"recordId\":\"weekly\"}",
    "state": { "values": {
      "mon": { "location": { "selected_option": { "value": "durham" } } },
      "tue": { "location": { "selected_option": { "value": "remote" } } }
    }}
  }
}
```

**What Rails returns to Slack:**

- bad signature → `401`
- `block_actions` → empty `200` immediately, then background the work
- `view_submission` happy path → empty `200` (this closes the modal)
- `view_submission` validation error → `200` with JSON:
  ```json
  { "response_action": "errors", "errors": { "mon": "Pick a location" } }
  ```

### B. Outbound — Rails → Slack Web API

Bot token as `Authorization: Bearer xoxb-…`. Same calls the Node code makes:

| Method | Body | Purpose |
| --- | --- | --- |
| `views.open` | `{ trigger_id, view }` | open the Edit modal (time-sensitive) |
| `chat.update` | `{ channel, ts, text, blocks }` | rewrite the DM in place on confirm/save |
| `chat.postMessage` | `{ channel, text, blocks }` | weekly DM / fallback confirmation |
| `conversations.open` | `{ users: "U123" }` → `{ channel: { id } }` | open a DM channel |
| `users.list` / `usergroups.users.list` / `users.info` | pagination params | resolve recipients |

Each returns `{ "ok": true, … }` or `{ "ok": false, "error": "…" }`.

### C. Internal — the schedule resource

Domain object unchanged: `WeekSchedule = { mon, tue, wed, thu, fri }`, each ∈
`falls church | durham | remote`, keyed by user. Becomes a `Schedule` model. The
Slack flow touches it **in-process** (no HTTP). Add HTTP endpoints only if the
React `client/` needs schedules — using the existing envelope:

```
GET   /api/v1/schedule            → current user's week
PATCH /api/v1/schedule            body: { "schedule": { "mon": "durham", ... } }
POST  /api/v1/schedule/confirm    → records confirmed_at (mirrors confirmSchedule)
```

```json
{ "status": { "code": 200, "message": "Schedule updated" },
  "data": { "schedule": { "mon": "durham", "tue": "remote", "confirmed_at": "2026-07-09T..." } } }
```

---

## Phased delivery

### PR 1 — Interactivity endpoint in Rails (behind the existing Node outbound)

Smallest cut that lets Slack's Request URL point at Rails.

1. Add `slack-ruby-client` + a queue backend; wire Solid Queue.
2. `Slack::SignatureVerifier` (port `verify.ts`) — HMAC-SHA256 over the **raw**
   body, 5-minute replay window, `timingSafeEqual` equivalent
   (`ActiveSupport::SecurityUtils.secure_compare`). Reading the raw body means a
   `before_action` that consumes `request.raw_post` before params parsing.
3. `Slack::Week`, `Slack::PromptBuilder`, `Slack::ScheduleModal` — ports of
   `schedule_store.ts` domain bits, `prompt.ts`, `schedule_modal.ts`.
4. `Schedule` model + migration; `slack_user_id` on `users`.
5. `Api::V1::Slack::InteractionsController#create` — verify → `head :ok` →
   `HandleSlackInteractionJob`. The job dispatches `block_actions` /
   `view_submission` exactly like `handleInteraction` in `server.ts`.
6. Update the Slack app **Request URL** to
   `https://<api-host>/api/v1/slack/interactions`.
7. Specs: request spec for signature pass/fail + each interaction type; unit
   specs for prompt/modal builders (port `tests/*`).

At this point `server.ts` and `verify.ts` are dead; the Node cron can keep
sending the weekly DM temporarily.

### PR 2 — Move the outbound send, delete the directory

1. `Slack::Directory` (port `slack_service.ts` — active-member filter, group
   resolution, pagination) and `Slack::Messenger` (port `slack_messenger.ts`,
   including the `USE_SLACK` no-op switch).
2. `SendWeeklyPromptJob` (port `send_prompt.ts`).
3. Recurring schedule: Solid Queue recurring task **Fridays 12:00
   `America/New_York`** (replaces `scheduler.ts`).
4. `lib/tasks/slack.rake` → `slack:send_weekly` (replaces `send_now.ts`).
5. Delete `services/slack-bot` entirely; drop it from `docker-compose.dev.yml`,
   `justfile`, root `package-lock.json`, and any CI.
6. Update root `README.md` to describe the Rails-owned flow.

---

## Verification checklist

- [ ] Signature verification rejects a tampered body and a stale timestamp.
- [ ] Edit button opens the modal within Slack's 3s trigger window.
- [ ] Modal Save rewrites the original DM in place (`chat.update` via
      `private_metadata` channel/ts), with the fresh-DM fallback when absent.
- [ ] Confirm button persists + re-renders with the confirmed state.
- [ ] Weekly job DMs the resolved active group members; `USE_SLACK=false` makes
      every send a no-op.
- [ ] Unknown Slack user id maps to a real `User` (or is handled gracefully).
