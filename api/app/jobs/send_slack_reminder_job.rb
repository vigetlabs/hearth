class SendSlackReminderJob < ApplicationJob
  queue_as :default

  def perform(*args)
    slack_client = SlackClient.new
    slack_ids_by_email = slack_client.slack_ids_by_email

    week_start = Date.current.beginning_of_week(:monday)

    Office.find_each do |office|
      users_to_notify(office:, week_start:).find_each do |user|
        slack_user_id = slack_ids_by_email[user.email.downcase]

        if slack_user_id.blank?
          next
        end

        slack_client.post_message(
          channel: slack_user_id,
          text: "Hello #{user.first_name}, make sure to confirm your schedule for next week"
        )
      end
    end

  end

  private

  def users_to_notify(office:, week_start:)
    User
      .where(office:)
      .where.not(
        id: AttendanceConfirmation
          .where(
            office:,
            period_type: :week,
            starts_on: week_start
          )
          .select(:user_id)
      )
  end
end
