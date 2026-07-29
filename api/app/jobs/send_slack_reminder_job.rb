class SendSlackReminderJob < ApplicationJob
  queue_as :default

  def perform(*args)
    slack_client = SlackClient.new
    slack_ids_by_email = slack_client.slack_ids_by_email

    week_start = Date.current.next_week

    Office.find_each do |office|
      confirmed_list = confirmed_user_ids(office:, week_start:)
      User.where(office:).find_each do |user|
        slack_user_id = slack_ids_by_email[user.email.downcase]
        next if slack_user_id.blank?

        text =
          if confirmed_list.include?(user.id)
            "Hello #{user.first_name}, your schedule is confirmed for next week."
          else
            "Hello #{user.first_name}, make sure to confirm your schedule for next week."
          end

        slack_client.post_message(
          channel: slack_user_id,
          text:
        )
      end
    end

  end

  private

  def confirmed_user_ids(office:, week_start:)
    AttendanceConfirmation
      .where(
        office:,
        period_type: :week,
        starts_on: week_start
      )
      .pluck(:user_id)
        .to_set
  end
end
