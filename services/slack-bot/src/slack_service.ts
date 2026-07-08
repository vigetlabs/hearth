import { WebClient } from '@slack/web-api'
import { config } from './config.ts'

export type SlackMember = {
  id?: string
  profile?: { email?: string; real_name?: string }
}

// An interface plus a live implementation, so tests can inject a fake.
export interface SlackService {
  botClient: WebClient
  listActiveUsers(): Promise<SlackMember[]>
  listActiveGroupMembers(usergroupId: string): Promise<SlackMember[]>
}

// Same "real, active person" test the reference app persists to its DB — here we
// just apply it live at send time.
function isActiveMember(u: {
  deleted?: boolean
  is_bot?: boolean
  is_restricted?: boolean
  name?: string
}): boolean {
  return (
    u.deleted === false &&
    u.is_bot === false &&
    u.is_restricted === false && // contractors / guests
    u.name !== 'vl' && // shared vl@viget.com account, not a person (no-op on other workspaces)
    u.name !== 'slackbot'
  )
}

export class LiveSlackService implements SlackService {
  botClient: WebClient

  constructor(botClient = new WebClient(config.botToken)) {
    this.botClient = botClient
  }

  // Every active real person in the workspace — the same pool the reference app
  // (ketchup) targets. users.list returns everyone who ever joined, paginated,
  // so we walk the cursor and filter each page to real, active people. Uses the
  // bot token (needs users:read + users:read.email scopes).
  async listActiveUsers(): Promise<SlackMember[]> {
    const members: SlackMember[] = []
    let cursor: string | undefined

    do {
      const res = await this.botClient.users.list({ limit: 200, cursor })
      members.push(...(res.members ?? []).filter(isActiveMember))
      cursor = res.response_metadata?.next_cursor || undefined
    } while (cursor)

    return members
  }

  // Resolve a Slack user group to its members, then keep only active accounts.
  // The group is the "subset" selector, maintained in Slack; the active-account
  // check is the same dynamic filter as listActiveUsers. Uses the bot token
  // throughout (needs the usergroups:read scope).
  async listActiveGroupMembers(usergroupId: string): Promise<SlackMember[]> {
    const res = await this.botClient.usergroups.users.list({
      usergroup: usergroupId,
    })
    const ids = res.users ?? []

    const infos = await Promise.all(
      ids.map((id) => this.botClient.users.info({ user: id })),
    )

    return infos
      .map((r) => r.user)
      .filter((u): u is NonNullable<typeof u> => u !== undefined && isActiveMember(u))
  }
}

// For tests: no network, returns whatever roster you hand it.
export class FakeSlackService implements SlackService {
  botClient = {} as WebClient
  private users: SlackMember[]

  constructor(users: SlackMember[] = []) {
    this.users = users
  }

  async listActiveUsers(): Promise<SlackMember[]> {
    return this.users
  }

  async listActiveGroupMembers(): Promise<SlackMember[]> {
    return this.users
  }
}
