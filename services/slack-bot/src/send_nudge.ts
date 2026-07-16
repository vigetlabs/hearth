// Nudge one person by email: find the active workspace member with that email
// and DM them the weekly prompt. For poking someone who hasn't confirmed yet.
//   npm run send-nudge -- someone@example.com
import { assertConfig } from './config.ts'
import { nudgeByEmail } from './nudge.ts'

assertConfig(['botToken'])

const email = process.argv[2]
if (!email) {
  console.error('Usage: npm run send-nudge -- <email>')
  process.exit(1)
}

const outcome = await nudgeByEmail(email)
if (!outcome.found) {
  console.error(`No active workspace member found with email ${outcome.email}.`)
  process.exit(1)
}

console.log(
  `Nudged ${outcome.id}: ${outcome.success ? 'ok' : 'failed'}.`,
)
if (!outcome.success) process.exit(1)
