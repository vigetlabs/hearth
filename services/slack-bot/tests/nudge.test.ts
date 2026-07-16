// nudgeByEmail: resolve the active-member pool, find the one whose profile email
// matches (case-insensitively), and DM them. USE_SLACK is false so the send is a
// no-op that reports success — this isolates the find-by-email logic from the
// network. A missing match reports { found: false } without attempting a send.
import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { nudgeByEmail } from '../src/nudge.ts'
import { buildNudge, CONFIRM_SCHEDULE } from '../src/prompt.ts'
import { config } from '../src/config.ts'
import type { SlackService, SlackMember } from '../src/slack_service.ts'
import type { KnownBlock, ActionsBlock } from '@slack/web-api'
import type { WebClient } from '@slack/web-api'

// Serves a fixed active-member roster and records how many times it was resolved.
class FakeRoster implements SlackService {
  botClient = {} as WebClient
  listCalls = 0
  members: SlackMember[]

  constructor(members: SlackMember[]) {
    this.members = members
  }

  async listActiveUsers(): Promise<SlackMember[]> {
    this.listCalls += 1
    return this.members
  }

  async listActiveGroupMembers(): Promise<SlackMember[]> {
    return this.members
  }
}

const originalUseSlack = config.useSlack
afterEach(() => {
  config.useSlack = originalUseSlack
})

const roster: SlackMember[] = [
  { id: 'U1', profile: { email: 'alice@example.com' } },
  { id: 'U2', profile: { email: 'bob@example.com' } },
]

test('nudges the member whose email matches', async () => {
  config.useSlack = false
  const slack = new FakeRoster(roster)

  const outcome = await nudgeByEmail('bob@example.com', slack)

  assert.deepEqual(outcome, { found: true, id: 'U2', success: true })
})

test('matches email case-insensitively and ignores surrounding whitespace', async () => {
  config.useSlack = false
  const slack = new FakeRoster(roster)

  const outcome = await nudgeByEmail('  Alice@Example.com  ', slack)

  assert.deepEqual(outcome, { found: true, id: 'U1', success: true })
})

test('reports found: false when no active member has the email', async () => {
  config.useSlack = false
  const slack = new FakeRoster(roster)

  const outcome = await nudgeByEmail('nobody@example.com', slack)

  assert.deepEqual(outcome, { found: false, email: 'nobody@example.com' })
})

test('does not match a member that has no email on file', async () => {
  config.useSlack = false
  const slack = new FakeRoster([{ id: 'U3' }])

  const outcome = await nudgeByEmail('anything@example.com', slack)

  assert.deepEqual(outcome, { found: false, email: 'anything@example.com' })
})

// buildNudge produces the nudge's own message — a reminder, not the first-send
// greeting — while staying actionable via the same Confirm button so the
// recipient can confirm straight from the nudge.
const findActions = (blocks: KnownBlock[]): ActionsBlock =>
  blocks.find((b): b is ActionsBlock => b.type === 'actions')!

test('buildNudge leads with a reminder, not the weekly greeting', () => {
  const { text, blocks } = buildNudge('nudge-2026-07-15')

  assert.match(text, /reminder/i)
  const header = blocks.find(
    (b): b is Extract<KnownBlock, { type: 'section' }> => b.type === 'section',
  )
  assert.match((header?.text as { text: string }).text, /nudge/i)
})

test('buildNudge carries the recordId on an actionable Confirm button', () => {
  const recordId = 'nudge-2026-07-15'
  const { blocks } = buildNudge(recordId)

  const confirm = findActions(blocks).elements.find(
    (el) => 'action_id' in el && el.action_id === CONFIRM_SCHEDULE,
  )
  assert.ok(confirm, 'nudge should offer a Confirm button')
  assert.equal((confirm as { value?: string }).value, recordId)
})
