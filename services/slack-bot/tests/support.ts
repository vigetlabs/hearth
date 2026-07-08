// Shared test doubles. No network — every "Slack client" here is a plain object
// cast to WebClient that returns canned responses and records what it was called
// with. Kept out of the test glob (not a *.test.ts file) so it isn't run as a suite.
import type { WebClient } from '@slack/web-api'

export type FakeUser = {
  id?: string
  name?: string
  deleted?: boolean
  is_bot?: boolean
  is_restricted?: boolean
  profile?: { email?: string; real_name?: string }
}

let seq = 0

// An active, real human by default — every field the active-member filter checks
// is explicitly set to a "passing" value. Override any of them to push the user
// outside a filter category (deactivated, bot, restricted, reserved name).
export function makeUser(overrides: Partial<FakeUser> = {}): FakeUser {
  seq += 1
  return {
    id: `U${seq}`,
    name: `person${seq}`,
    deleted: false,
    is_bot: false,
    is_restricted: false,
    profile: { email: `person${seq}@example.com`, real_name: `Person ${seq}` },
    ...overrides,
  }
}

type UsersListPage = { members: FakeUser[]; next_cursor?: string }

// Fake bot client for listActiveUsers: serves the given pages of users.list in
// order and records the cursor passed on each call so pagination can be asserted.
export function fakeUsersListClient(pages: UsersListPage[]): {
  client: WebClient
  cursorsSeen: (string | undefined)[]
} {
  let call = 0
  const cursorsSeen: (string | undefined)[] = []
  const client = {
    users: {
      list: async ({ cursor }: { limit?: number; cursor?: string }) => {
        cursorsSeen.push(cursor)
        const page = pages[call] ?? { members: [] }
        call += 1
        return {
          members: page.members,
          response_metadata: { next_cursor: page.next_cursor ?? '' },
        }
      },
    },
  }
  return { client: client as unknown as WebClient, cursorsSeen }
}

// Fake bot client for listActiveGroupMembers: usergroups.users.list yields the
// given ids, and users.info resolves each id via the lookup map (an id mapped to
// undefined simulates a member whose profile no longer resolves).
export function fakeGroupClient(
  memberIds: string[],
  usersById: Record<string, FakeUser | undefined>,
): WebClient {
  const client = {
    usergroups: {
      users: {
        list: async () => ({ users: memberIds }),
      },
    },
    users: {
      info: async ({ user }: { user: string }) => ({ user: usersById[user] }),
    },
  }
  return client as unknown as WebClient
}

type SendClientOpts = {
  // Channel id returned by conversations.open; null simulates "no channel".
  openChannelId?: string | null
  postOk?: boolean
  permalink?: string
}

// Fake bot client for SlackMessenger: records open/post/permalink calls and lets
// each response be steered to exercise the success and failure branches.
export function fakeSendClient(opts: SendClientOpts = {}): {
  client: WebClient
  calls: { open: any[]; post: any[]; permalink: any[] }
} {
  const calls = { open: [] as any[], post: [] as any[], permalink: [] as any[] }
  const client = {
    conversations: {
      open: async (args: any) => {
        calls.open.push(args)
        const id = opts.openChannelId === undefined ? 'D123' : opts.openChannelId
        return { channel: id ? { id } : undefined }
      },
    },
    chat: {
      postMessage: async (args: any) => {
        calls.post.push(args)
        return { ok: opts.postOk ?? true, channel: 'D123', ts: '111.222' }
      },
      getPermalink: async (args: any) => {
        calls.permalink.push(args)
        return { permalink: opts.permalink ?? 'https://slack.example/link' }
      },
    },
  }
  return { client: client as unknown as WebClient, calls }
}
