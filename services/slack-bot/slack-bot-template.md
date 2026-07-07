# Minimal Slack Bot Template

A framework-agnostic starting skeleton for a Slack bot, modeled on Ketchup's
integration but stripped to the essentials. Four pieces:

1. **Config** — tokens and secrets from the environment
2. **Client wrapper** — a testable abstraction over `@slack/web-api`
3. **Messenger** — outbound Block Kit messages (DMs + channels)
4. **Interactivity endpoint** — receives button clicks, with signature verification

Only hard dependency is the official SDK:

```bash
npm install @slack/web-api
```

## 1. Slack app setup

1. Create an app at https://api.slack.com/apps (one per environment is a good pattern).
2. **Bot Token Scopes** (OAuth & Permissions): `chat:write`, `im:write`,
   `mpim:write` (group DMs), `users:read`.
3. **User Token Scopes** (only if you need the full roster with emails):
   `users:read`, `users:read.email`.
4. Install to the workspace. Copy the **Bot token** (`xoxb-…`), **User token**
   (`xoxp-…`), and the **Signing Secret** (Basic Information).
5. For buttons/modals/slash commands, enable **Interactivity & Shortcuts** and
   set the **Request URL** to your endpoint (below). Locally, tunnel with
   `ngrok http <port>` and use the forwarding URL.

```bash
# .env
SLACK_BOT_TOKEN=xoxb-...
SLACK_USER_TOKEN=xoxp-...
SLACK_SIGNING_SECRET=...
USE_SLACK=false   # no-op sends in dev
```

## 2. Client wrapper — `slack_service.ts`

An interface plus a live implementation, so tests can inject a fake.

```ts
import { WebClient } from '@slack/web-api'

export type SlackMember = {
  id?: string
  profile?: { email?: string; real_name?: string }
}

export interface SlackService {
  botClient: WebClient
  userClient: WebClient
  listActiveUsers(): Promise<SlackMember[]>
}

export class LiveSlackService implements SlackService {
  constructor(
    public botClient = new WebClient(process.env.SLACK_BOT_TOKEN),
    public userClient = new WebClient(process.env.SLACK_USER_TOKEN)
  ) {}

  // users.list returns everyone who ever joined — filter to real, active people.
  async listActiveUsers(): Promise<SlackMember[]> {
    const res = await this.userClient.users.list({})
    return (res.members ?? []).filter(
      (u: any) =>
        u.deleted === false &&
        u.is_bot === false &&
        u.is_restricted === false &&
        u.name !== 'slackbot'
    )
  }
}

// For tests:
export class FakeSlackService implements SlackService {
  botClient = {} as WebClient
  userClient = {} as WebClient
  constructor(private users: SlackMember[] = []) {}
  async listActiveUsers() {
    return this.users
  }
}
```

## 3. Messenger — `slack_messenger.ts`

Wraps the **bot** client for outbound messages. The `USE_SLACK` flag turns real
sends into no-ops so you can run locally without spamming a workspace.

```ts
import type { KnownBlock } from '@slack/web-api'
import type { SlackService } from './slack_service.js'

type SendParams = { text?: string; blocks: KnownBlock[] }
type Result<T = {}> = { success: false } | ({ success: true } & T)

export class SlackMessenger {
  constructor(
    private slack: SlackService,
    private userIds: string[] = []
  ) {}

  private get enabled() {
    return process.env.USE_SLACK === 'true'
  }

  // DM one user, or a group DM if userIds has several.
  async sendDirectMessage({ text, blocks }: SendParams): Promise<Result> {
    if (!this.enabled) return { success: true }
    if (this.userIds.length === 0) throw new Error('no user ids for DM')

    try {
      const { channel } = await this.slack.botClient.conversations.open({
        users: this.userIds.join(','),
      })
      if (!channel?.id) throw new Error('no channel id')

      const { ok } = await this.slack.botClient.chat.postMessage({
        channel: channel.id,
        text,
        blocks,
      })
      return ok ? { success: true } : { success: false }
    } catch {
      return { success: false }
    }
  }

  // Post to a channel and return a permalink you can reference elsewhere.
  async sendChannelMessage(
    channelId: string,
    { text, blocks }: SendParams
  ): Promise<Result<{ permalink?: string }>> {
    if (!this.enabled) return { success: true }

    try {
      const post = await this.slack.botClient.chat.postMessage({
        channel: channelId,
        text,
        blocks,
      })
      if (!post.ok) throw new Error('post failed')

      const link = await this.slack.botClient.chat.getPermalink({
        channel: post.channel!,
        message_ts: post.ts!,
      })
      return { success: true, permalink: link.permalink }
    } catch {
      return { success: false }
    }
  }
}
```

Example message with interactive buttons. Encode any domain ID you'll need later
into the button `value` — that's how the handler knows what to act on.

```ts
const RECORD_YES = 'record_yes'
const RECORD_NO = 'record_no'

await new SlackMessenger(slack, [slackUserId]).sendDirectMessage({
  text: 'Quick question',
  blocks: [
    { type: 'section', text: { type: 'mrkdwn', text: 'Did it happen?' } },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '👍 Yes' },
          action_id: RECORD_YES,
          style: 'primary',
          value: String(recordId), // <-- domain id travels with the click
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'No' },
          action_id: RECORD_NO,
          value: String(recordId),
        },
      ],
    },
  ],
})
```

## 4. Interactivity endpoint

Slack POSTs a `application/x-www-form-urlencoded` body with a `payload` field
(JSON) to your Request URL. **Verify the signature first** — this endpoint is
public and mutates data.

### Signature verification (framework-agnostic)

Requires the *raw* request body, so capture it before any body parser rewrites it.

```ts
import crypto from 'node:crypto'

export function verifySlackSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  signingSecret = process.env.SLACK_SIGNING_SECRET!
): boolean {
  // Reject requests older than 5 minutes (replay protection).
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 60 * 5) return false

  const base = `v0:${timestamp}:${rawBody}`
  const digest =
    'v0=' + crypto.createHmac('sha256', signingSecret).update(base).digest('hex')

  const a = Buffer.from(digest)
  const b = Buffer.from(signature)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
```

### Handler (plain Node `http` example)

```ts
import http from 'node:http'
import { verifySlackSignature } from './verify.js'

http
  .createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/slack/handle-event') {
      res.writeHead(404).end()
      return
    }

    let raw = ''
    req.on('data', (c) => (raw += c))
    req.on('end', async () => {
      const ok = verifySlackSignature(
        raw,
        req.headers['x-slack-request-timestamp'] as string,
        req.headers['x-slack-signature'] as string
      )
      if (!ok) {
        res.writeHead(401).end()
        return
      }

      const body = new URLSearchParams(raw)
      const payload = JSON.parse(body.get('payload')!)
      const action = payload.actions[0]
      const recordId = action.value // the id we encoded on the button
      const yes = action.action_id === 'record_yes'

      await updateRecord(recordId, yes) // <-- your domain logic

      // Ack fast (must be < 3s). Swap the message for a confirmation
      // by POSTing to payload.response_url with replace_original: true.
      await fetch(payload.response_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replace_original: true,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Thanks <@${payload.user.id}>! Recorded ✅`,
              },
            },
          ],
        }),
      })

      res.writeHead(200).end()
    })
  })
  .listen(3000)

async function updateRecord(_id: string, _yes: boolean) {
  /* persist */
}
```

> If you use Express, register a raw-body capture for this route
> (`express.raw({ type: '*/*' })`) so the signature check sees the unparsed body.
> Slack also requires a response within **3 seconds** — do slow work after acking,
> or push it to a queue.

## 5. Triggering outbound messages

Ketchup runs in-process cron jobs (`node-cron` / `cron`) that invoke CLI commands.
Pick whatever fits your bot:

```ts
import { CronJob } from 'cron'
import { LiveSlackService } from './slack_service.js'
import { SlackMessenger } from './slack_messenger.js'

// Every weekday at 10:00 ET
CronJob.from({
  cronTime: '0 10 * * 1-5',
  timeZone: 'America/New_York',
  start: true,
  onTick: async () => {
    const slack = new LiveSlackService()
    const users = await slack.listActiveUsers()
    for (const u of users) {
      await new SlackMessenger(slack, [u.id!]).sendDirectMessage({
        text: 'Good morning!',
        blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'Good morning! ☀️' } }],
      })
    }
  },
})
```

Alternatives: a hosted scheduler (GitHub Actions cron, cloud scheduler), a job
queue, or — if the bot is reactive rather than scheduled — Slack **Events API**
subscriptions and **slash commands** (both hit HTTP endpoints and use the same
signature verification as above).

## Checklist

- [ ] Slack app created; bot (+ optional user) token and signing secret in env
- [ ] Bot scopes: `chat:write`, `im:write`, `mpim:write`, `users:read`
- [ ] Client wrapper with a fake for tests
- [ ] Messenger with a `USE_SLACK` dev kill-switch
- [ ] Interactivity Request URL set (ngrok locally)
- [ ] Signature verification on the inbound endpoint (raw body + timestamp check)
- [ ] Ack interactions within 3s; defer slow work
- [ ] Domain IDs encoded in button `value`s
```