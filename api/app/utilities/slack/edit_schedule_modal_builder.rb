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
          schedule_input_block,
          *external_visit_blocks
        ].compact
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
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Which days are you in the #{office.emoji} *#{office.name.titleize}* office next week?"
        }
      }
    end

    def schedule_input_block
      return if date_options.empty?

      {
        type: "input",
        block_id: "schedule_days",
        optional: true,
        label: plain_text("In office?"),
        element: {
          type: "checkboxes",
          action_id: "selected_dates",
          options: date_options,
          initial_options: initial_date_options
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

    def date_options
      editable_weekdays.map { |date| date_option(date) }
    end

    def initial_date_options
      date_options.select do |option|
        selected_dates.any? do |date|
          date.iso8601 == option.fetch(:value)
        end
      end
    end

    def editable_weekdays
      weekdays.reject do |date|
        external_visits.key?(date)
      end
    end

    def external_visit_blocks
      weekdays.filter_map do |date|
        visit = external_visits[date]
        next unless visit

        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: <<~TEXT.strip
              :lock: *#{format_date(date)}*
              Already scheduled at #{visit.office.emoji} *#{visit.office.name.titleize}*
            TEXT
          }
        }
      end
    end

    def date_option(date)
      {
        text: plain_text(format_date(date)),
        value: date.iso8601
      }
    end

    def format_date(date)
      "#{date.strftime("%A")}  ·  #{date.strftime("%b %-d")}"
    end

    def weekdays
      (0..4).map { |offset| week_start + offset.days }
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
