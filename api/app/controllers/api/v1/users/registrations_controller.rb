class Api::V1::Users::RegistrationsController < Devise::RegistrationsController
  include ApiResponse
  include Helpers::SerializeUserHelper
  include Helpers::ValidationErrorFormatterHelper
  include Handlers::RecordInvalidHandler
  include Handlers::BadRequestHandler

  rescue_from ActiveRecord::RecordInvalid, with: :handle_invalid_record
  rescue_from ActionController::ParameterMissing, with: :handle_missing_parameter

  respond_to :json

  def create
    new_user = User.create!(sign_up_params)

    data = { user: serialize_user(new_user) }

    success_response(
      data: data,
      message: "User created successfully",
      status: :created
    )
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
