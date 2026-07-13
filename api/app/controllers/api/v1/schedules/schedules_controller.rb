class Api::V1::Schedules::SchedulesController < ApplicationController
  include Handlers::BadRequestHandler
  include Handlers::RecordInvalidHandler
  include ApiResponse

  rescue_from ActiveRecord::RecordInvalid, with: :handle_invalid_record
  rescue_from ActionController::ParameterMissing, with: :handle_missing_parameter

  before_action :authenticate_user!, only: [ :create ]

  def create
    new_schedule = current_user.schedules.create!(schedule_params)

    serialized_schedule = ScheduleSerializer
      .new(new_schedule)
      .serializable_hash[:data][:attributes]

    data = { schedule: serialized_schedule }

    success_response(
      data: data,
      message: "Created schedule successfully",
      status: :created
    )
  end

  def schedule_params
    params.require(:schedule).permit(
      :is_default,
      :monday,
      :tuesday,
      :wednesday,
      :thursday,
      :friday,
      :saturday,
      :sunday,
    )
  end
end
