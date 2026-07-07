import { WebClient } from '@slack/web-api'
import { config } from './config.ts'

export type SlackMember = {
  id?: string
  profile?: { email?: string; real_name?: string }
}

// An interface plus a live implementation, so tests can inject a fake.
export interface SlackService {
  botClient: WebClient
  userClient: WebClient
  listActiveUsers(): Promise<SlackMember[]>
}

export class LiveSlackService implements SlackService {
  botClient: WebClient
  userClient: WebClient

  constructor(
    botClient = new WebClient(config.botToken),
    userClient = new WebClient(config.userToken),
  ) {
    this.botClient = botClient
    this.userClient = userClient
  }

  // users.list returns everyone who ever joined — filter to real, active people.
  async listActiveUsers(): Promise<SlackMember[]> {
    const res = await this.userClient.users.list({})
    return (res.members ?? []).filter(
      (u) =>
        u.deleted === false &&
        u.is_bot === false &&
        u.is_restricted === false &&
        u.name !== 'slackbot',
    )
  }
}

// For tests: no network, returns whatever roster you hand it.
export class FakeSlackService implements SlackService {
  botClient = {} as WebClient
  userClient = {} as WebClient
  private users: SlackMember[]

  constructor(users: SlackMember[] = []) {
    this.users = users
  }

  async listActiveUsers(): Promise<SlackMember[]> {
    return this.users
  }
}
