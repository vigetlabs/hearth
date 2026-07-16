class Api::V1::Visits::VisitsController < ApplicationController
  include ApiResponse
  include Handlers::RecordInvalidHandler
  include Handlers::BadRequestHandler

  rescue_from ActiveRecord::RecordInvalid, with: :handle_invalid_record
  rescue_from ActionController::ParameterMissing, with: :handle_missing_parameter
  rescue_from ActionController::BadRequest, with: :handle_bad_request

  before_action :authenticate_user!, only: [ :create, :index ]

  CALENDAR_VIEWS = %w[week]

  def index
    range = date_range

    visits = Visit
      .where(
        visit_date: range,
        office_id: calendar_office_id
      )
      .order(:visit_date)

    serialized_visits = VisitSerializer
      .new(visits)
      .serializable_hash[:data]
      .map { |visit| visit[:attributes] }

    data = { visits: serialized_visits }

    success_response(
      data: data,
      message: "Fetched visits successfully"
    )
  end

  def create
    visits = Visit.transaction do
      visits_params.map do |attributes|
        visit = current_user.visits.find_or_initialize_by(
          visit_date: attributes[:visit_date]
        )

        visit.update!(office_id: attributes[:office_id])
        visit
      end
    end

    serialized_visits = VisitSerializer
      .new(visits)
      .serializable_hash[:data]
      .map { |visit| visit[:attributes] }

    data = { visits: serialized_visits }
    success_response(
      data: data,
      message: "Created visits successfully",
      status: :created
    )
  end

  private

  def visits_params
    params.require(:visits).map do |visit_params|
      visit_params.permit(:office_id, :visit_date)
    end
  end

  def calendar_office_id
    Integer(params.require(:office_id), 10)
  rescue ArgumentError, TypeError
    raise ActionController::BadRequest, "Invalid office ID"
  end

  def date_range
    @date_range ||= begin
     date = calendar_date

     case calendar_view
     when "week"
       start_date = date.beginning_of_week(:sunday)
       end_date = date.end_of_week(:sunday)
     end

     start_date..end_date
    end
  end

  def calendar_date
    @calendar_date ||= Date.iso8601(
      params[:date].presence || Date.current.iso8601
    )
  rescue Date::Error
    raise ActionController::BadRequest, "Invalid date"
  end


  def calendar_view
    view = params[:view].presence || "week"
    return view if CALENDAR_VIEWS.include?(view)
    raise ActionController::BadRequest, "Invalid calendar view"
  end
end
