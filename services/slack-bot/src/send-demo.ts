// One-shot sender to verify the bot against a real workspace.
//   npm run send-demo -- <SLACK_USER_ID>
// or set DEMO_USER_ID in .env. Requires USE_SLACK=true to actually send.
import { assertConfig, config } from './config.ts'
import { LiveSlackService } from './slack_service.ts'
import { SlackMessenger } from './slack_messenger.ts'

assertConfig(['botToken'])

const userId = process.argv[2] ?? process.env.DEMO_USER_ID
if (!userId) {
  console.error('Usage: npm run send-demo -- <SLACK_USER_ID>')
  process.exit(1)
}

const RECORD_YES = 'record_yes'
const RECORD_NO = 'record_no'
const recordId = 'demo-123' // domain id travels with the click

const slack = new LiveSlackService()
const result = await new SlackMessenger(slack, [userId]).sendDirectMessage({
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
          value: String(recordId),
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

if (!config.useSlack) {
  console.log('USE_SLACK=false — send was a no-op. Set USE_SLACK=true to actually send.')
} else {
  console.log(result)
}
