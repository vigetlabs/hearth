class Api::V1::Slack::SlackInteractionsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false

  def create
    payload = JSON.parse(params.require(:payload))

    case payload["type"]
    when "block_actions"
      handle_block_actions(payload)
    when "view_submission"
      handle_view_submission(payload)
    end

    head :ok
  end

  private

  def handle_block_actions(payload)
    action = payload.fetch("actions").first

    return unless action.fetch("action_id") == "edit_schedule"

    action_data = JSON.parse(action.fetch("value"))

    user = User.find(action_data.fetch("user_id"))
    week_start = Date.iso8601(action_data.fetch("week_start"))
    week_range = week_start..(week_start + 4.days)
    office = user.office

    message_ts = payload.dig("message", "ts")
    channel_id = payload.dig("channel", "id")

    visits = user.visits
      .includes(:office)
      .where(visit_date: week_range)

    selected_dates = visits
      .select { |visit| visit.office_id == office.id }
      .map(&:visit_date)

    external_visits = visits
      .reject { |visit| visit.office_id == office.id }
      .index_by(&:visit_date)

    view = Slack::EditScheduleModalBuilder.new(
      user_id: user.id,
      week_start:,
      office:,
      selected_dates:,
      external_visits:,
      channel_id:,
      message_ts:
    ).call

    slack_client.views_open(
      trigger_id: payload.fetch("trigger_id"),
      view:
    )
  end

  def handle_view_submission(payload)
    view = payload.fetch("view")

    return unless view.fetch("callback_id") == "edit_schedule_modal"

    metadata = JSON.parse(
      payload.dig("view", "private_metadata")
    )

    week_start = Date.iso8601(metadata.fetch("week_start"))
    user = User.find(metadata.fetch("user_id"))
    office = Office.find(metadata.fetch("office_id"))

    channel_id = metadata.fetch("channel_id")
    message_ts = metadata.fetch("message_ts")

    selected_dates = selected_dates_from(view)

    confirm_result = ConfirmWeekService.new(
      user:,
      office:,
      week_start:,
      selected_dates:
    ).call

    msg = Slack::ReminderMsgBuilder.new(
      user:,
      week_start:,
      confirmed: true
    ).call

    slack_client.update_message(
      channel: channel_id,
      ts: message_ts,
      text: msg.fetch(:text),
      blocks: msg.fetch(:blocks)
    )
  end

  def slack_client
    @slack_client ||= SlackClient.new
  end

  def selected_dates_from(view)
  values = view
    .fetch("state")
    .fetch("values")

  values.filter_map do |block_id, actions|
    next unless block_id.start_with?("schedule_day_")

    selected_options = actions
      .fetch("selected_date")
      .fetch("selected_options", [])

    selected_value = selected_options
      .first
      &.fetch("value", nil)

    Date.iso8601(selected_value) if selected_value
  end
end
end
