import http from 'node:http'
import { assertConfig, config } from './config.ts'
import { verifySlackSignature } from './verify.ts'

// Signature verification needs the signing secret.
assertConfig(['signingSecret'])

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/slack/handle-event') {
    res.writeHead(404).end()
    return
  }

  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', async () => {
    // This endpoint is public and mutates data — verify the signature first.
    const ok = verifySlackSignature(
      raw,
      req.headers['x-slack-request-timestamp'] as string,
      req.headers['x-slack-signature'] as string,
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

    // Ack fast (must be < 3s). Swap the message for a confirmation by POSTing to
    // payload.response_url with replace_original: true.
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

server.listen(config.port, () => {
  console.log(
    `slack-bot interactivity endpoint listening on ` +
      `http://localhost:${config.port}/slack/handle-event`,
  )
})

async function updateRecord(id: string, yes: boolean): Promise<void> {
  // Replace with a call into the Rails API / your domain persistence.
  console.log(`record ${id} -> ${yes ? 'yes' : 'no'}`)
}
