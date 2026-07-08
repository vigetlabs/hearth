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

      response "200", "logged in successfully" do
        schema "$ref" => "#/components/schemas/user_response"

        let!(:user) { create(:user) }

        let(:payload) do
          {
            user: {
              email: user.email,
              password: "password"
            }
          }
        end

        run_test!
      end

      response "401", "invalid login credentials" do
        schema "$ref" => "#/components/schemas/user_devise_invalid_login_response"

        let!(:user) { create(:user) }

        let(:payload) do
          {
            user: {
              email: user.email,
              password: "wrongpassword"
            }
          }
        end

        run_test!
      end
    end
  end
end
