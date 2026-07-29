class SlackClient
  def initialize(token: Rails.application.credentials.dig(:slack, :bot_token))
    @client = Slack::Web::Client.new(token:)
  end

  def authentication_info
    @client.auth_test
  end
  
  def post_message(channel:, text:, blocks: nil)
    attributes = {
      channel:,
      text:
    }

    attributes[:blocks] = blocks if blocks.present?

    @client.chat.postMessage(**attributes)
  end
end
