# typed: strict

class Api::V1::AttendanceConfirmations::AttendanceConfirmationsController < ApplicationController
  extend T::Sig
  include ApiResponse
  include Handlers::RecordNotFoundHandler
  include Handlers::BadRequestHandler

  rescue_from ActiveRecord::RecordNotFound, with: :handle_record_not_found
  rescue_from ActionController::BadRequest, with: :handle_bad_request
  rescue_from ActionController::ParameterMissing, with: :handle_missing_parameter

  before_action :authenticate_user!

  sig { void }
  def index
    office = T.let(find_office!, Office)
    week_start = T.let(normalized_week_start!, Date)

    confirmations =
      AttendanceConfirmation
        .where(
          office: office,
          period_type: :week,
          starts_on: week_start
        )
        .order(:user_id)

    serialized_confs = AttendanceConfirmationSerializer
      .new(confirmations)
      .serializable_hash[:data]
      .map { |conf| conf[:attributes] }

    data = { confirmations: serialized_confs }

    success_response(
      data: data,
      message: "Fetched attendance confirmations successfully"
    )
  end

  sig { void }
  def create
    office = T.let(find_office!, Office)
    week_start = T.let(normalized_week_start!, Date)
    selected_dates = T.let(parsed_selected_dates!, T::Array[Date])
    user = T.must(current_user)

    confirm_result =
      ConfirmWeekService
        .new(
          user: user,
          office: office,
          week_start: week_start,
          selected_dates: selected_dates
        )
        .call

      serialized_confirmation = AttendanceConfirmationSerializer
        .new(confirm_result.confirmation)
        .serializable_hash[:data][:attributes]

      serialized_visits = VisitSerializer
        .new(confirm_result.visits)
        .serializable_hash[:data]
        .map { |visit| visit[:attributes] }

      data = {
        attendance_confirmation: serialized_confirmation,
        visits: serialized_visits
      }

      success_response(
        data: data,
        message: "Successfully created confirmed visits"
      )
  end

  private


  sig { returns(Office) }
  def find_office!
    Office.find(office_id_param)
  end

  sig { returns(Integer) }
  def office_id_param
    value = params.require(:office_id)

    return value if value.is_a?(Integer)

    Integer(value, 10)
  rescue ArgumentError, TypeError
    raise ActionController::BadRequest,
      "office_id must be a valid integer"
  end

  sig { returns(Date) }
  def normalized_week_start!
    date =
      Date.iso8601(
        params.require(:starts_on)
      )

    date.beginning_of_week(:monday)
  rescue Date::Error, TypeError
    raise ActionController::BadRequest,
      "starts_on must be a valid date"
  end

  sig { returns(T::Array[Date]) }
  def parsed_selected_dates!
    raw_dates = params.fetch(:selected_dates)

    unless raw_dates.is_a?(Array)
      raise ActionController::BadRequest,
        "selected_dates must be an array"
    end

    raw_dates.map do |raw_date|
      Date.iso8601(raw_date)
    rescue Date::Error, TypeError
      raise ActionController::BadRequest,
        "selected_dates must contain valid dates"
    end
  rescue KeyError
    raise ActionController::ParameterMissing, :selected_dates
  end
end
