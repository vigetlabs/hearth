class Api::V1::Visits::VisitsController < ApplicationController
  include ApiResponse
  include Handlers::RecordInvalidHandler
  include Handlers::BadRequestHandler

  rescue_from ActiveRecord::RecordInvalid, with: :handle_invalid_record
  rescue_from ActionController::ParameterMissing, with: :handle_missing_parameter

  before_action :authenticate_user!, only: [ :create ]

  def create
    visits = Visit.transaction do
      visits_params.map do |attributes|
        current_user.visits.create!(attributes)
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
end
