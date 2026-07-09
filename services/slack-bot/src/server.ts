import http from 'node:http'
import { assertConfig, config } from './config.ts'
import { verifySlackSignature } from './verify.ts'
import { EDIT_SCHEDULE } from './prompt.ts'
import { LiveSlackService } from './slack_service.ts'
import { SlackMessenger } from './slack_messenger.ts'
import { buildPrompt } from './prompt.ts'
import { InMemoryScheduleStore, formatWeek } from './schedule_store.ts'
import type { ScheduleStore } from './schedule_store.ts'
import {
  SCHEDULE_MODAL_CALLBACK,
  buildScheduleModal,
  parseSchedule,
} from './schedule_modal.ts'
import type { SubmittedView } from './schedule_modal.ts'

// Verifying requests needs the signing secret; opening the modal + DMing a
// confirmation need the bot token.
assertConfig(['signingSecret', 'botToken'])

// Live Slack client for outbound calls (views.open, confirmation DM). Swap
// `store` for a Rails-backed ScheduleStore later — nothing else here changes.
const slack = new LiveSlackService()
const store: ScheduleStore = new InMemoryScheduleStore()

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/slack/handle-event') {
    res.writeHead(404).end()
    return
  }

  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    // This endpoint is public and acts on user input — verify the signature
    // against the raw body first.
    const ok = verifySlackSignature(
      raw,
      req.headers['x-slack-request-timestamp'] as string,
      req.headers['x-slack-signature'] as string,
    )
    if (!ok) {
      res.writeHead(401).end()
      return
    }

    // Ack immediately (Slack requires a response within 3s). An empty 200 also
    // tells Slack to close the modal on a view_submission. Then do the work.
    res.writeHead(200).end()

    try {
      const body = new URLSearchParams(raw)
      const payload = JSON.parse(body.get('payload') ?? '{}') as Interaction
      handleInteraction(payload).catch((err) =>
        console.error('failed to handle interaction:', err),
      )
    } catch (err) {
      console.error('failed to parse interaction:', err)
    }
  })
})

server.listen(config.port, () => {
  console.log(
    `slack-bot interactivity endpoint listening on ` +
      `http://localhost:${config.port}/slack/handle-event`,
  )
})

// The slice of interaction payloads we read. Loosely typed on purpose — Slack
// sends many shapes to one URL and we only care about a couple of them.
type Interaction = {
  type?: string
  user?: { id?: string }
  trigger_id?: string
  actions?: Array<{ action_id?: string; value?: string }>
  // On a block_actions from a message button, these locate the source message
  // so we can rewrite it later.
  container?: { message_ts?: string }
  channel?: { id?: string }
  view?: SubmittedView
}

// What we stash in the modal's private_metadata so the submit handler can find
// (and re-render) the original message.
type MessageRef = { channel?: string; ts?: string; recordId?: string }

function parseMessageRef(raw?: string): MessageRef {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as MessageRef
  } catch {
    return {}
  }
}

async function handleInteraction(payload: Interaction): Promise<void> {
  switch (payload.type) {
    case 'block_actions':
      await handleBlockActions(payload)
      break
    case 'view_submission':
      await handleViewSubmission(payload)
      break
    default:
      console.log(`unhandled interaction type: ${payload.type}`)
  }
}

// A button was clicked. For "Edit Schedule", open the modal seeded with the
// user's current week. trigger_id is only valid ~3s, so this runs right after ack.
async function handleBlockActions(payload: Interaction): Promise<void> {
  const action = payload.actions?.[0]
  if (!action) return

  switch (action.action_id) {
    case EDIT_SCHEDULE: {
      const userId = payload.user?.id
      if (!userId || !payload.trigger_id) return

      // Carry the source message's location (+ its record id) into the modal so
      // the submit handler can rewrite that same message.
      const ref: MessageRef = {
        channel: payload.channel?.id,
        ts: payload.container?.message_ts,
        recordId: action.value,
      }

      const week = await store.getSchedule(userId)
      await slack.botClient.views.open({
        trigger_id: payload.trigger_id,
        view: buildScheduleModal(week, JSON.stringify(ref)),
      })
      break
    }
    default:
      console.log(`unhandled action: ${action.action_id}`)
  }
}

// The modal's Save button was pressed. Slack sends the whole form state, so we
// persist the entire week in one write, then DM a confirmation.
async function handleViewSubmission(payload: Interaction): Promise<void> {
  if (payload.view?.callback_id !== SCHEDULE_MODAL_CALLBACK) return

  const userId = payload.user?.id
  if (!userId) return

  const week = parseSchedule(payload.view)
  await store.setSchedule(userId, week)
  console.log(`saved schedule for ${userId}:`, week)

  // Preferred path: rewrite the original DM in place so it shows the saved week.
  const ref = parseMessageRef(payload.view.private_metadata)
  if (ref.channel && ref.ts) {
    const { text, blocks } = buildPrompt(ref.recordId ?? 'weekly', week)
    await slack.botClient.chat.update({ channel: ref.channel, ts: ref.ts, text, blocks })
    return
  }

  // Fallback (no source message to update): confirm with a fresh DM.
  await new SlackMessenger(slack, userId).sendDirectMessage({
    text: 'Your schedule for next week is updated',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':white_check_mark:  *Schedule updated for next week!*',
        },
      },
      { type: 'section', text: { type: 'mrkdwn', text: formatWeek(week) } },
    ],
  })
}
