// SlackMessenger: honors the USE_SLACK kill switch, opens a DM before posting,
// and maps Slack's responses to success/failure. config.useSlack is mutated per
// test and restored afterward.
import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { SlackMessenger } from '../src/slack/messenger.ts'
import { config } from '../src/config.ts'
import { fakeSendClient } from './support.ts'
import type { SlackService } from '../src/slack/client.ts'

function serviceWith(client: SlackService['botClient']): SlackService {
  return { botClient: client } as unknown as SlackService
}

const originalUseSlack = config.useSlack
afterEach(() => {
  config.useSlack = originalUseSlack
})

test('sendDirectMessage is a no-op success when USE_SLACK is false', async () => {
  config.useSlack = false
  const { client, calls } = fakeSendClient()
  const res = await new SlackMessenger(serviceWith(client), 'U1').sendDirectMessage({
    blocks: [],
  })
  assert.deepEqual(res, { success: true })
  assert.equal(calls.open.length, 0) // never hit the network
  assert.equal(calls.post.length, 0)
})

test('sendDirectMessage opens a DM and posts when enabled', async () => {
  config.useSlack = true
  const { client, calls } = fakeSendClient({ openChannelId: 'D9', postOk: true })
  const res = await new SlackMessenger(serviceWith(client), 'U1').sendDirectMessage({
    text: 'hi',
    blocks: [],
  })

  assert.deepEqual(res, { success: true })
  assert.equal(calls.open[0].users, 'U1') // opens the 1:1 conversation
  assert.equal(calls.post[0].channel, 'D9') // posts to the opened channel
})

test('sendDirectMessage throws when enabled with no recipient', async () => {
  config.useSlack = true
  const { client } = fakeSendClient()
  await assert.rejects(
    () => new SlackMessenger(serviceWith(client)).sendDirectMessage({ blocks: [] }),
    /no user id/,
  )
})

test('sendDirectMessage returns failure when no channel is opened', async () => {
  config.useSlack = true
  const { client } = fakeSendClient({ openChannelId: null })
  const res = await new SlackMessenger(serviceWith(client), 'U1').sendDirectMessage({
    blocks: [],
  })
  assert.deepEqual(res, { success: false })
})

test('sendDirectMessage returns failure when postMessage is not ok', async () => {
  config.useSlack = true
  const { client } = fakeSendClient({ postOk: false })
  const res = await new SlackMessenger(serviceWith(client), 'U1').sendDirectMessage({
    blocks: [],
  })
  assert.deepEqual(res, { success: false })
})

test('sendChannelMessage is a no-op success when USE_SLACK is false', async () => {
  config.useSlack = false
  const { client, calls } = fakeSendClient()
  const res = await new SlackMessenger(serviceWith(client)).sendChannelMessage('C1', {
    blocks: [],
  })
  assert.deepEqual(res, { success: true })
  assert.equal(calls.post.length, 0)
})

test('sendChannelMessage posts and returns a permalink on success', async () => {
  config.useSlack = true
  const { client, calls } = fakeSendClient({ postOk: true, permalink: 'https://x/y' })
  const res = await new SlackMessenger(serviceWith(client)).sendChannelMessage('C1', {
    text: 'yo',
    blocks: [],
  })
  assert.deepEqual(res, { success: true, permalink: 'https://x/y' })
  assert.equal(calls.post[0].channel, 'C1')
})

test('sendChannelMessage returns failure when postMessage is not ok', async () => {
  config.useSlack = true
  const { client } = fakeSendClient({ postOk: false })
  const res = await new SlackMessenger(serviceWith(client)).sendChannelMessage('C1', {
    blocks: [],
  })
  assert.deepEqual(res, { success: false })
})
