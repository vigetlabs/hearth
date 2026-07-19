# typed: strict

class Api::V1::AttendanceConfirmations::AttendanceConfirmationsController < ApplicationController
  extend T::Sig
  include ApiResponse
  include Handlers::RecordNotFoundHandler
  include Handlers::BadRequestHandler

  rescue_from ActiveRecord::RecordNotFound, with: :handle_record_not_found
  rescue_from ActionController::BadRequest, with: :handle_bad_request

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

  private


  sig { returns(Office) }
  def find_office!
    Office.find(office_id_param)
  end

  sig { returns(Integer) }
  def office_id_param
    value = params.require(:office_id)
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
    raw_dates = params.require(:selected_dates)

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
  end
end
