class SlackClient
  USERS_PAGE_SIZE = 200

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

    @client.chat_postMessage(**attributes)
  end

  def slack_ids_by_email
    lookup = {}

    workspace_users.each do |slack_user|
      next if slack_user.deleted
      next if slack_user.is_bot

      email = slack_user.profile.email&.downcase
      next if email.blank?

      lookup[email] = slack_user.id
    end

    lookup
  end

  def workspace_users
    members = []
    cursor = nil

    loop do
      response = @client.users_list(
        limit: USERS_PAGE_SIZE,
        cursor:
      )

      members.concat(response.members)

      cursor = response.response_metadata&.next_cursor
      break if cursor.blank?
    end

    members
  end
end
