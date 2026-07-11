class Api::V1::Users::SessionsController < Devise::SessionsController
  include ApiResponse
  include SerializeUserHelper

  respond_to :json

  private

  def respond_with(resource, _opts = {})
    user = serialize_user(current_user)
    data = { user: user }
    success_response(
      data: data,
      message: "Logged in successfully"
    )
  end

  def respond_to_on_destroy(_)
    success_response(
      message: "Logged out successfully"
    )
  end
end
