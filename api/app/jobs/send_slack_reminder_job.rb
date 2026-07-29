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

      slack_client.post_message(
        channel: slack_user_id,
        text: reminder_message(
          user:,
          week_start:,
          confirmed: 
        )
      )
    end
  end

  private

  def reminder_message(user:, week_start:, confirmed:)
    if confirmed
      confirmed_message(
        user:,
        week_start:
      )
    else
      unconfirmed_message(
        user:,
        week_start:
      )
    end
  end

  def confirmed_message(user:, week_start:)
    visits = 
      Visit
        .includes(:office)
        .where(
          user:,
          visit_date: week_start..week_start.end_of_week(:sunday)
        )
        .order(:visit_date)

    <<~MESSAGE
      Hello #{user.first_name}, your schedule is confirmed for next week!

      Your confirmed dates:
      #{format_visits(visits)}
    MESSAGE

  end

  def unconfirmed_message(user:, week_start:)
    <<~MESSAGE
      Hello #{user.first_name}, make sure to confirm your schedule for next week.

      Your default schedule for #{user.office.name}:
      #{format_default_schedule(user.default_schedule, week_start:)}
    MESSAGE
  end

  def format_visits(visits)
    return "No in-office dates selected." if visits.empty?

    visits
      .map do |visit|
        "• #{visit.visit_date.strftime('%A, %-d')} — #{visit.office.name}"
      end
      .join("\n")
  end

  def format_default_schedule(default_schedule, week_start:)
    return "No default schedule configured." unless default_schedule

    dates = (week_start..week_start.end_of_week(:sunday)).select do |date|
      default_schedule.public_send(date.strftime("%A").downcase)
    end

    format_dates(dates)
  end

  def format_dates(dates)
    return "No in-office dates selected." if dates.empty?

    dates
      .map { |date| "• #{date.strftime('%A, %-d')}" }
      .join("\n")
  end

  def attendance_confirmed?(user:, week_start:)
    AttendanceConfirmation.exists?(
      user:,
      period_type: :week,
      starts_on: week_start
    )
  end
end
