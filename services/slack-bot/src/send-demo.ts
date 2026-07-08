// One-shot sender to verify the bot against a real workspace by DMing a single
// user (yourself). Unlike send-now, this ignores the user group.
//   npm run send-demo -- <SLACK_USER_ID>
// or set DEMO_USER_ID in .env. Requires USE_SLACK=true to actually send.
import { assertConfig, config } from './config.ts'
import { LiveSlackService } from './slack_service.ts'
import { SlackMessenger } from './slack_messenger.ts'
import { buildPrompt } from './prompt.ts'

assertConfig(['botToken'])

const userId = process.argv[2] ?? process.env.DEMO_USER_ID
if (!userId) {
  console.error('Usage: npm run send-demo -- <SLACK_USER_ID>')
  process.exit(1)
}

const slack = new LiveSlackService()
const result = await new SlackMessenger(slack, [userId]).sendDirectMessage(
  buildPrompt('demo-123'),
)

if (!config.useSlack) {
  console.log('USE_SLACK=false — send was a no-op. Set USE_SLACK=true to actually send.')
} else {
  console.log(result)
}
