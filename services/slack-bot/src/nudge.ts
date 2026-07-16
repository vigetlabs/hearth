import { LiveSlackService } from './slack_service.ts'
import type { SlackService } from './slack_service.ts'
import { SlackMessenger } from './slack_messenger.ts'
import { buildNudge } from './prompt.ts'

// Not found: no active workspace member has this email. Found: we DM'd them and
// report whether the send succeeded (mirrors SendOutcome from send_prompt.ts).
export type NudgeOutcome =
  | { found: false; email: string }
  | { found: true; id: string; success: boolean }

// Nudge a single person by email. Resolves the same active-member pool as the
// group send (send_prompt.ts), then keeps only the one whose profile email
// matches — so the same active-account filter applies and a deactivated/guest
// account won't be nudged. Email match is case-insensitive.
//
// Reading emails off users.list requires the `users:read.email` scope on the
// bot token (in addition to the scopes the group send already needs).
export async function nudgeByEmail(
  email: string,
  slack: SlackService = new LiveSlackService(),
): Promise<NudgeOutcome> {
  const target = email.trim().toLowerCase()
  const members = await slack.listActiveUsers()
  const member = members.find((m) => m.profile?.email?.toLowerCase() === target)

  if (!member?.id) return { found: false, email }

  const message = buildNudge(`nudge-${new Date().toISOString().slice(0, 10)}`)
  const res = await new SlackMessenger(slack, member.id).sendDirectMessage(
    message,
  )
  return { found: true, id: member.id, success: res.success }
}
