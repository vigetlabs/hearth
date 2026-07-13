class Api::V1::Visits::VisitsController < ApplicationController
  include ApiResponse

  def create
    visits = Visit.transaction do
      visits_params.map do |attributes|
        current_user.visits.create!(attributes)
      end
    end
  end

  private

  def visits_params
    params.require(:visits).map do |visit_params|
      visits_params.permit(:office_id, :visit_date)
    end
  end
end
