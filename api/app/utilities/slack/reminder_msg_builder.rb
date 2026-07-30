module Slack
  class ReminderMsgBuilder
    def initialize(user:, week_start:, confirmed:)
      @user = user
      @week_start = week_start
      @confirmed = confirmed
    end

    def call
      if @confirmed
        confirmed_message
      else
        unconfirmed_message
      end
    end

    private

    attr_reader :user, :week_start

    def confirmed_message
      {
        text: "#{user.first_name}, your schedule is confirmed for next week.",
        blocks: confirmed_blocks
      }

    end

    def unconfirmed_message
      {
        text: "#{user.first_name}, make sure to confirm your schedule for next week.",
        blocks: unconfirmed_blocks
      }
    end

    def confirmed_blocks
      [
        Slack::BlockKit.header_block(
          ":white_check_mark: *Here’s your confirmed office schedule for next week!* _(#{formatted_week_range})_"
        ),
        Slack::BlockKit.divider_block,
        Slack::BlockKit.schedule_block(format_week_schedule),
        Slack::BlockKit.divider_block,
        Slack::BlockKit.coordination_block(
          heading: "Need to make a change?",
          description: "See who else is heading in that week, or edit your schedule."
        ),
        Slack::InteractionKit.actions_section(
          block_id: action_block_id("confirmed"),
          elements: [
            view_calendar_button,
            edit_schedule_button
          ]
        )
      ]
    end

    def unconfirmed_blocks
      [
        Slack::BlockKit.header_block(
          ":wave: *#{user.first_name}, make sure to confirm your schedule for next week!* #{(formatted_week_range)}"
        ),
        Slack::BlockKit.divider_block,
        Slack::BlockKit.schedule_block(format_week_schedule),
        Slack::BlockKit.divider_block,
        Slack::BlockKit.coordination_block(
          heading: "Coordinating with your team?",
          description: "See who else is heading in that week, then confirm or edit your days."
        ),
        Slack::InteractionKit.actions_section(
          block_id:action_block_id("unconfirmed"),
          elements: [
            view_calendar_button,
            confirm_schedule_button,
            edit_schedule_button,
          ]
        )
      ]
    end

    def view_calendar_button
      Slack::InteractionKit.url_button(
        text: "👀 See who’s in",
        action_id: "view_calendar",
        url: calendar_url
      )
    end

    def confirm_schedule_button
      Slack::InteractionKit.url_button(
        text: "Confirm",
        action_id: "confirm_schedule",
        url: calendar_url,
        style: "primary"
      )
    end

    def edit_schedule_button
      Slack::InteractionKit.modal_button(
        text: "Edit Schedule",
        action_id: "edit_schedule",
        value: {
          user_id: user.id,
          week_start: week_start.iso8601
        }.to_json,
        style: "primary"
      )
    end

    def format_week_schedule
      Slack::WeekScheduleFormatter.new(
        dates: possible_dates,
        visits:
      ).call
    end

    def action_block_id(status)
      "schedule_actions_#{status}_#{user.id}_#{week_start}"
    end


    def visits
      @visits ||=
        Visit
          .includes(:office)
          .where(
            user:,
            visit_date: possible_dates
          )
          .order(:visit_date)
    end

    def possible_dates
      @possible_dates ||= (week_start..week_start + 4.days).to_a
    end

    def calendar_url
      "#{Rails.configuration.x.frontend_url}/calendar"
    end

    def formatted_week_range
      week_end = week_start + 4.days

      if week_start.month == week_end.month
        "#{week_start.strftime("%b %-d")} - #{week_end.strftime("%-d")}"
      else
        "#{week_start.strftime("%b %-d")} - #{week_end.strftime("%b %-d")}"
      end
    end
  end
end
