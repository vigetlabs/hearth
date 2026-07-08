require "swagger_helper"

RSpec.describe "Api::V1::Users::Sessions", type: :request do
  path "/api/v1/users/login" do
    post "Logs in a user to their account" do
      tags "Users"
      consumes "application/json"
      produces "application/json"

      parameter name: :payload,
        in: :body,
        required: true,
        schema: { "$ref" => "#/components/schemas/login_user_request" }
    end
  end
end
