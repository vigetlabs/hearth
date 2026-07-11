class Api::V1::Users::RegistrationsController < Devise::RegistrationsController
  include ApiResponse
  include SerializeUserHelper

  respond_to :json

  def create
    new_user = User.new(sign_up_params)

    if new_user.save
      user = serialize_user(new_user)
      data = { user: user }
      success_response(
        data: data,
        message: "User created successfully",
        status: :created
      )
    else
      error_response(
        message: "User could not be created",
        errors: validation_errors(new_user),
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

  def validation_errors(record)
    record.errors.map do |error|
      {
        field: error.attribute.to_s,
        message: error.message
      }
    end
  end
end
