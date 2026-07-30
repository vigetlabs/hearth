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
      external_visits:
    ).call

    slack_client.views_open(
      trigger_id: payload.fetch("trigger_id"),
      view:
    )
  end

  def handle_view_submission(payload)
    return unless payload.dig("view", "callback_id") == "edit_schedule_modal"

    metadata = JSON.parse(
      payload.dig("view", "private_metadata")
    )

    slack_user_id = metadata.fetch("slack_user_id")
    week_start = metadata.fetch("week_start")
  end

  def slack_client
    @slack_client ||= SlackClient.new
  end
end
