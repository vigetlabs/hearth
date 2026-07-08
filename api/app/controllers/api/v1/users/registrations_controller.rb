class Api::V1::Users::RegistrationsController < ApplicationController
  include ApiResponse

  respond_to :json

  def create
    new_user = User.new(sign_up_params)

    if new_user.save
      user = UserSerializer
        .new(new_user)
        .serializable_hash[:data][:attributes]
      data = { user: user }
      success_response(
        data: data,
        message: "User created successfully",
        status: :created
      )
    else
      error_response(
        message: "User could not be created",
      )
    end
  end

  private

  def sign_up_params
    params.require(:user)
      .permit(
        :email,
        :first_name,
        :last_name,
        :password,
        :password_confirmation,
      )
  end
end
