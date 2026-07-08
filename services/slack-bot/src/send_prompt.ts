import { LiveSlackService } from './slack_service.ts'
import type { SlackService } from './slack_service.ts'
import { SlackMessenger } from './slack_messenger.ts'
import { buildPrompt } from './prompt.ts'
import { config } from './config.ts'

export type SendOutcome = { id: string; success: boolean }

// Resolve the recipient pool live, filter to active accounts, and DM each member
// the weekly prompt. Shared by the scheduler (Fridays) and the manual `send-now`
// trigger, so both send the exact same thing.
//
// Pool: every active real person in the workspace (matching the reference app),
// unless SLACK_USERGROUP_ID is set — then just that group's active members, handy
// for narrower testing. Which workspace is hit is decided entirely by the bot
// token in .env: your personal workspace in dev, Viget's in prod.
export async function sendWeeklyPrompt(
  slack: SlackService = new LiveSlackService(),
): Promise<SendOutcome[]> {
  const members = config.usergroupId
    ? await slack.listActiveGroupMembers(config.usergroupId)
    : await slack.listActiveUsers()
  const message = buildPrompt(`weekly-${new Date().toISOString().slice(0, 10)}`)

  const outcomes: SendOutcome[] = []
  for (const member of members) {
    if (!member.id) continue
    const res = await new SlackMessenger(slack, [member.id]).sendDirectMessage(
      message,
    )
    outcomes.push({ id: member.id, success: res.success })
  }

  if (!config.useSlack) {
    console.log(
      `USE_SLACK=false — resolved ${outcomes.length} member(s) but all sends ` +
        `were no-ops. Set USE_SLACK=true to actually deliver.`,
    )
  }
  return outcomes
}
