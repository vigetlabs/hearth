class Api::V1::Schedules::SchedulesController < ApplicationController
  include RecordInvalidHandler
  include RecordNotFoundHandler
  include ApiResponse

  rescue_from ActiveRecord::RecordInvalid, with: :handle_invalid_record
  rescue_from ActiveRecord::RecordNotFound, with: :handle_record_not_found
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
