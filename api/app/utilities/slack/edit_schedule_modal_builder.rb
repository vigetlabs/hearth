module Slack
  class EditScheduleModalBuilder
    def initialize(
      user_id:,
      week_start:,
      office:,
      selected_dates:,
      external_visits:
    )
      @user_id = user_id
      @week_start = normalize_date(week_start)
      @office = office
      @selected_dates = selected_dates.map { |date| normalize_date(date) }
      @external_visits = external_visits.transform_keys do |date|
        normalize_date(date)
      end
    end

    def call
      {
        type: "modal",
        callback_id: "edit_schedule_modal",
        private_metadata: private_metadata.to_json,
        title: plain_text("Edit Schedule"),
        submit: plain_text("Save"),
        close: plain_text("Cancel"),
        blocks: [
          introduction_block,
          *schedule_day_blocks
        ]
      }
    end

    private

    attr_reader(
      :user_id,
      :week_start,
      :office,
      :selected_dates,
      :external_visits
    )

    def introduction_block
      Slack::BlockKit.header_block(
        "Which days are you in the #{office.emoji} *#{office.name.titleize}* office next week?"
      )
    end

    def schedule_day_blocks
      weekdays.map do |date|
        external_visit = external_visits[date]

        if external_visit
          external_visit_block(date, external_visit)
        else
          editable_date_block(date)
        end
      end
    end

    def editable_date_block(date)
      option = date_option(date)

      element = {
        type: "checkboxes",
        action_id: "selected_date",
        options: [option]
      }

      if selected_dates.include?(date)
        element[:initial_options] = [option]
      end

      {
        type: "input",
        block_id: date_block_id(date),
        optional: true,
        label: plain_text(format_date(date)),
        element:
      }
    end

    def external_visit_block(date, visit)
      {
        type: "section",
        block_id: external_visit_block_id(date),
        text: {
          type: "mrkdwn",
          text: <<~TEXT.strip
            *#{format_date(date)}*
            :lock: Scheduled at #{visit.office.emoji} *#{visit.office.name.titleize}*
          TEXT
        }
      }
    end

    def private_metadata
      {
        user_id:,
        week_start: week_start.iso8601,
        office_id: office.id
      }
    end

    def date_option(date)
      {
        text: plain_text("In office"),
        value: date.iso8601
      }
    end

    def date_block_id(date)
      "schedule_day_#{date.iso8601}"
    end

    def external_visit_block_id(date)
      "external_visit_#{date.iso8601}"
    end

    def format_date(date)
      "#{date.strftime("%A")}  ·  #{date.strftime("%b %-d")}"
    end

    def weekdays
      (0..4).map do |offset|
        week_start + offset.days
      end
    end

    def plain_text(text)
      {
        type: "plain_text",
        text:
      }
    end

    def normalize_date(value)
      case value
      when Date
        value
      when Time, DateTime
        value.to_date
      else
        Date.iso8601(value.to_s)
      end
    end
  end
end
