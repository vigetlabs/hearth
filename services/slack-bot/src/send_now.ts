// Manually fire the weekly group send once, right now — same message and
// recipients the Friday scheduler uses. For testing without waiting for Friday.
//   npm run send-now
import { assertConfig } from './config.ts'
import { sendWeeklyPrompt } from './send_prompt.ts'

assertConfig(['botToken'])

const outcomes = await sendWeeklyPrompt()
const ok = outcomes.filter((o) => o.success).length
console.log(`Sent to ${ok}/${outcomes.length} active group member(s).`)
for (const o of outcomes) {
  console.log(`  ${o.id}: ${o.success ? 'ok' : 'failed'}`)
}
