class Api::V1::Users::SessionsController < ApplicationController
  include ApiResponse

  respond_to :json

  private

  def respond_with(resource, _opts = {})
    user = UserSerializer
      .new(current_user)
      .serializable_hash[:data][:attributes]
    data = { user: user }
    success_response(
      data: data,
      message: "Logged in successfully"
    )
  end
end
