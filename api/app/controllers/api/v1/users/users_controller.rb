class Api::V1::Users::UsersController < ApplicationController
  include RecordInvalidHandler
  include ApiResponse
  include SerializeUserHelper

  rescue_from ActiveRecord::RecordInvalid, with: :handle_invalid_record

  before_action :authenticate_user!

  def update
    current_user.update!(user_params)
    user = serialize_user(current_user)

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
      :office_id
    )
  end
end
