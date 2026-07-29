module Slack
  module InteractionKit
    def self.url_button(text:, action_id:, url:, **attributes)
      {
        type: "button",
        text: {
          type: "plain_text",
          text: text,
          emoji: true
        },
        action_id: action_id,
        url: url,
        **attributes
      }
    end

    def self.actions_section(block_id:, elements:)
      {
        type: "actions",
        block_id: block_id,
        elements: elements
      }
    end
  end
end
