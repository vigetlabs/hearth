class SendSlackReminderJob < ApplicationJob
  queue_as :default

  def perform(*args)
    slack_client = SlackClient.new
    slack_ids_by_email = slack_client.slack_ids_by_email

    week_start = Date.current.next_week

    User.includes(:default_schedule, :office).find_each do |user|
      slack_user_id = slack_ids_by_email[user.email.downcase]
      next if slack_user_id.blank?

      confirmed = attendance_confirmed?(user:, week_start:)

      msg = Slack::ReminderMsgBuilder.new(
        user:,
        week_start:,
        confirmed:
      ).call

      slack_client.post_message(
        channel: slack_user_id,
        text: msg[:text],
        blocks: msg[:blocks]
      )
    end
  end

  private

  def attendance_confirmed?(user:, week_start:)
    return true if default_office_confirmed?(
      user:,
      week_start:
    )

    whole_week_confirmed_elsewhere?(
      user:,
      week_start:
    )
  end

  def default_office_confirmed?(user:, week_start:)
    AttendanceConfirmation.exists?(
      user:,
      office: user.office,
      period_type: "week",
      starts_on: week_start
    )
  end

  def whole_week_confirmed_elsewhere?(user:, week_start:)
    possible_dates = (week_start..week_start + 4.days).to_set

    external_visit_dates =
      Visit
        .where(
          user:,
          visit_date: possible_dates
        )
        .where.not(office: user.office)
        .distinct
        .pluck(:visit_date)
        .to_set

    possible_dates.subset?(external_visit_dates)
  end
end
