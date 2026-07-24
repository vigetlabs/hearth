class Api::V1::Users::UsersController < ApplicationController
  include Handlers::RecordInvalidHandler
  include ApiResponse
  include Helpers::SerializeUserHelper

  # @TODO ADD TESTS FOR HANDLING BAD REQUEST
  rescue_from ActiveRecord::RecordInvalid, with: :handle_invalid_record

  before_action :authenticate_user!

  def index
   users = User
     .includes(:default_schedule, :office)
     .where(office_id: roster_office_id)
     .order(:first_name, :last_name)

   serialized_users = serialize_users(users)

   data = { users: serialized_users }

   success_response(
     data: data,
     message: "Fetched users by office successfully"
   )
  end

  def update
    ActiveRecord::Base.transaction do
      current_user.update!(user_params.except(:default_schedule))

      if (schedule_attributes = user_params[:default_schedule])
        schedule = current_user.default_schedule ||
          current_user.schedules.build(is_default: true)

        schedule.update!(schedule_attributes.to_h.merge(is_default: true))
      end
    end

    user = serialize_user(current_user.reload)

    data = { user: user }

    success_response(
      data: data,
      message: "Updated current user successfully"
    )
  end

  def me
    user = serialize_user(current_user)

    data = { user: user }
    success_response(
      data: data,
      message: "Fetched current user successfully"
    )
  end

  def user_params
    params.require(:user).permit(
      :first_name,
      :last_name,
      :office_id,
      default_schedule: [
        :is_default,
        :monday,
        :tuesday,
        :wednesday,
        :thursday,
        :friday,
        :saturday,
        :sunday
      ]
    )
  end

  def roster_office_id
    Integer(params.require(:office_id), 10)
  rescue ArgumentError, TypeError
    raise ActionController::BadRequest, "Invalid office ID"
  end
end
