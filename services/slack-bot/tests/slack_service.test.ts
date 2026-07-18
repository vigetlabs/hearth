// The heart of the recipient logic: does LiveSlackService keep exactly the active,
// real humans and drop everyone who falls outside the filter — plus walk every
// page of the roster? Runs against the real filter with a mocked Slack client.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LiveSlackService } from '../src/slack/client.ts'
import { makeUser, fakeUsersListClient, fakeGroupClient } from './support.ts'

test('listActiveUsers keeps active real humans', async () => {
  const { client } = fakeUsersListClient([
    { members: [makeUser({ id: 'U1' }), makeUser({ id: 'U2' })] },
  ])
  const res = await new LiveSlackService(client).listActiveUsers()
  assert.deepEqual(
    res.map((u) => u.id).sort(),
    ['U1', 'U2'],
  )
})

// One case per category the filter is meant to exclude. Each roster is [keeper,
// dropped]; only the keeper should survive.
const outsideFilter = [
  { label: 'deactivated account (former employee)', over: { deleted: true } },
  { label: 'bot / app user', over: { is_bot: true } },
  { label: 'restricted guest / contractor', over: { is_restricted: true } },
  { label: 'shared vl@viget.com account', over: { name: 'vl' } },
  { label: 'slackbot', over: { name: 'slackbot' } },
]

for (const { label, over } of outsideFilter) {
  test(`listActiveUsers excludes ${label}`, async () => {
    const { client } = fakeUsersListClient([
      { members: [makeUser({ id: 'KEEP' }), makeUser({ id: 'DROP', ...over })] },
    ])
    const res = await new LiveSlackService(client).listActiveUsers()
    assert.deepEqual(
      res.map((u) => u.id),
      ['KEEP'],
    )
  })
}

test('listActiveUsers drops the whole mixed roster except active humans', async () => {
  const { client } = fakeUsersListClient([
    {
      members: [
        makeUser({ id: 'KEEP1' }),
        makeUser({ id: 'DEL', deleted: true }),
        makeUser({ id: 'BOT', is_bot: true }),
        makeUser({ id: 'GUEST', is_restricted: true }),
        makeUser({ id: 'VL', name: 'vl' }),
        makeUser({ id: 'SB', name: 'slackbot' }),
        makeUser({ id: 'KEEP2' }),
      ],
    },
  ])
  const res = await new LiveSlackService(client).listActiveUsers()
  assert.deepEqual(
    res.map((u) => u.id).sort(),
    ['KEEP1', 'KEEP2'],
  )
})

test('listActiveUsers fails safe when status fields are missing', async () => {
  // No deleted/is_bot/is_restricted flags — the strict `=== false` checks should
  // exclude this user rather than assume they are active.
  const ghost = { id: 'GHOST', name: 'ghost', profile: {} }
  const { client } = fakeUsersListClient([{ members: [ghost] }])
  const res = await new LiveSlackService(client).listActiveUsers()
  assert.deepEqual(res, [])
})

test('listActiveUsers walks every page via cursor and filters each one', async () => {
  const { client, cursorsSeen } = fakeUsersListClient([
    {
      members: [makeUser({ id: 'A' }), makeUser({ id: 'BOT', is_bot: true })],
      next_cursor: 'page2',
    },
    { members: [makeUser({ id: 'B' }), makeUser({ id: 'DEL', deleted: true })] },
  ])
  const res = await new LiveSlackService(client).listActiveUsers()

  assert.deepEqual(
    res.map((u) => u.id).sort(),
    ['A', 'B'],
  )
  // First call has no cursor; the second must reuse the cursor from page one.
  assert.deepEqual(cursorsSeen, [undefined, 'page2'])
})

test('listActiveUsers stops after one page when there is no next cursor', async () => {
  const { client, cursorsSeen } = fakeUsersListClient([
    { members: [makeUser({ id: 'A' })] },
  ])
  await new LiveSlackService(client).listActiveUsers()
  assert.equal(cursorsSeen.length, 1)
})

test('listActiveUsers handles an empty roster', async () => {
  const { client } = fakeUsersListClient([{ members: [] }])
  const res = await new LiveSlackService(client).listActiveUsers()
  assert.deepEqual(res, [])
})

test('listActiveGroupMembers resolves ids, then keeps only active members', async () => {
  const client = fakeGroupClient(['U1', 'U2', 'U3', 'U4'], {
    U1: makeUser({ id: 'U1' }),
    U2: makeUser({ id: 'U2', deleted: true }), // deactivated inside the group
    U3: makeUser({ id: 'U3', is_restricted: true }),
    U4: makeUser({ id: 'U4' }),
  })
  const res = await new LiveSlackService(client).listActiveGroupMembers('S1')
  assert.deepEqual(
    res.map((u) => u.id).sort(),
    ['U1', 'U4'],
  )
})

test('listActiveGroupMembers drops ids whose profile no longer resolves', async () => {
  const client = fakeGroupClient(['U1', 'GONE'], {
    U1: makeUser({ id: 'U1' }),
    GONE: undefined,
  })
  const res = await new LiveSlackService(client).listActiveGroupMembers('S1')
  assert.deepEqual(
    res.map((u) => u.id),
    ['U1'],
  )
})

test('listActiveGroupMembers handles an empty group', async () => {
  const client = fakeGroupClient([], {})
  const res = await new LiveSlackService(client).listActiveGroupMembers('S1')
  assert.deepEqual(res, [])
})
