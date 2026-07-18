// sendWeeklyPrompt orchestration: pick the right recipient pool (whole workspace
// vs. a configured user group), DM each member, and report an outcome per id.
// USE_SLACK is false here, so the sends are no-ops that report success — this
// isolates the resolve-and-iterate logic from the network.
import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { sendWeeklyPrompt } from '../src/send-prompt.ts'
import { config } from '../src/config.ts'
import type { SlackService, SlackMember } from '../src/slack/client.ts'
import type { WebClient } from '@slack/web-api'

// Records which resolver ran so we can assert the pool-selection branch.
class SpySlackService implements SlackService {
  botClient = {} as WebClient
  calls: string[] = []
  workspace: SlackMember[]
  group: SlackMember[]

  constructor(workspace: SlackMember[], group: SlackMember[]) {
    this.workspace = workspace
    this.group = group
  }

  async listActiveUsers(): Promise<SlackMember[]> {
    this.calls.push('workspace')
    return this.workspace
  }

  async listActiveGroupMembers(usergroupId: string): Promise<SlackMember[]> {
    this.calls.push(`group:${usergroupId}`)
    return this.group
  }
}

const originalGroup = config.usergroupId
const originalUseSlack = config.useSlack
afterEach(() => {
  config.usergroupId = originalGroup
  config.useSlack = originalUseSlack
})

test('targets the whole workspace when no user group is configured', async () => {
  config.usergroupId = undefined
  config.useSlack = false
  const spy = new SpySlackService([{ id: 'U1' }, { id: 'U2' }], [{ id: 'G1' }])

  const outcomes = await sendWeeklyPrompt(spy)

  assert.deepEqual(spy.calls, ['workspace']) // group resolver never called
  assert.deepEqual(outcomes, [
    { id: 'U1', success: true },
    { id: 'U2', success: true },
  ])
})

test('targets just the group when SLACK_USERGROUP_ID is set', async () => {
  config.usergroupId = 'S99'
  config.useSlack = false
  const spy = new SpySlackService([{ id: 'WS' }], [{ id: 'G1' }, { id: 'G2' }])

  const outcomes = await sendWeeklyPrompt(spy)

  assert.deepEqual(spy.calls, ['group:S99']) // workspace resolver never called
  assert.deepEqual(
    outcomes.map((o) => o.id),
    ['G1', 'G2'],
  )
})

test('skips members that have no id', async () => {
  config.usergroupId = undefined
  config.useSlack = false
  const spy = new SpySlackService(
    [{ id: 'U1' }, { profile: { email: 'noid@example.com' } }, { id: 'U2' }],
    [],
  )

  const outcomes = await sendWeeklyPrompt(spy)

  assert.deepEqual(
    outcomes.map((o) => o.id),
    ['U1', 'U2'],
  )
})

test('returns an empty result set for an empty pool', async () => {
  config.usergroupId = undefined
  config.useSlack = false
  const spy = new SpySlackService([], [])

  const outcomes = await sendWeeklyPrompt(spy)

  assert.deepEqual(outcomes, [])
})
