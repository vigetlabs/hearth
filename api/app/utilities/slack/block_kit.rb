module Slack
  module BlockKit
    def self.header_block(text)
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "#{text}"
        }
      }
    end

    def self.divider_block
      {
        type: "divider"
      }
    end

    def self.schedule_block(schedule_text)
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: schedule_text
        }
      }
    end

    def self.coordination_block(heading:, description:)
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: <<~TEXT.strip
            *#{heading}*
            #{description}
          TEXT
        }
      }
    end
  end
end
