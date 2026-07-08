import type { KnownBlock } from '@slack/web-api'
import type { SlackService } from './slack_service.ts'
import { config } from './config.ts'

type SendParams = { text?: string; blocks: KnownBlock[] }
type Result<T = {}> = { success: false } | ({ success: true } & T)

// Wraps the bot client for outbound messages. The USE_SLACK flag turns real
// sends into no-ops so you can run locally without spamming a workspace.
export class SlackMessenger {
  private slack: SlackService
  private userId?: string

  constructor(slack: SlackService, userId?: string) {
    this.slack = slack
    this.userId = userId
  }

  private get enabled(): boolean {
    return config.useSlack
  }

  // DM a single user.
  async sendDirectMessage({ text, blocks }: SendParams): Promise<Result> {
    if (!this.enabled) return { success: true }
    if (!this.userId) throw new Error('no user id for DM')

    try {
      const { channel } = await this.slack.botClient.conversations.open({
        users: this.userId,
      })
      if (!channel?.id) throw new Error('no channel id')

      const { ok } = await this.slack.botClient.chat.postMessage({
        channel: channel.id,
        text,
        blocks,
      })
      return ok ? { success: true } : { success: false }
    } catch {
      return { success: false }
    }
  }

  // Post to a channel and return a permalink you can reference elsewhere.
  async sendChannelMessage(
    channelId: string,
    { text, blocks }: SendParams,
  ): Promise<Result<{ permalink?: string }>> {
    if (!this.enabled) return { success: true }

    try {
      const post = await this.slack.botClient.chat.postMessage({
        channel: channelId,
        text,
        blocks,
      })
      if (!post.ok) throw new Error('post failed')

      const link = await this.slack.botClient.chat.getPermalink({
        channel: post.channel!,
        message_ts: post.ts!,
      })
      return { success: true, permalink: link.permalink }
    } catch {
      return { success: false }
    }
  }
}
