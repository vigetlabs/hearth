import http from 'node:http'
import { assertConfig, config } from './config.ts'
import { verifySlackSignature } from './verify.ts'
import { UPDATE_SCHEDULE } from './prompt.ts'

// Signature verification needs the signing secret.
assertConfig(['signingSecret'])

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

    // Ack immediately (Slack requires a response within 3s), then do the work.
    res.writeHead(200).end()

    try {
      const body = new URLSearchParams(raw)
      const payload = JSON.parse(body.get('payload') ?? '{}') as BlockActions
      handleInteraction(payload)
    } catch (err) {
      console.error('failed to handle interaction:', err)
    }
  })
})

server.listen(config.port, () => {
  console.log(
    `slack-bot interactivity endpoint listening on ` +
      `http://localhost:${config.port}/slack/handle-event`,
  )
})

type BlockActions = {
  type?: string
  user?: { id?: string }
  actions?: Array<{ action_id?: string; value?: string }>
}

function handleInteraction(payload: BlockActions): void {
  if (payload.type !== 'block_actions') return

  const action = payload.actions?.[0]
  if (!action) return

  switch (action.action_id) {
    case UPDATE_SCHEDULE:
      // The button also carries a `url`, so Slack has already opened the editor
      // in the user's browser. We just record the click-through for now — this
      // is the seam where you'd persist intent via the Rails API.
      console.log(
        `user ${payload.user?.id} clicked Update Schedule (record ${action.value})`,
      )
      break
    default:
      console.log(`unhandled action: ${action.action_id}`)
  }
}
