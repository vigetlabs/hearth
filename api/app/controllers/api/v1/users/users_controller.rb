class Api::V1::Users::UsersController < ApplicationController
  include ApiResponse

  before_action :authenticate_user!

  def me
    user = UserSerializer
      .new(current_user)
      .serializable_hash[:data][:attributes]

    data = { user: user }
    success_response(
      data: data,
      message: "Fetched current user successfully"
    )
  end
end
