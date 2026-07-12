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
        schema "$ref" => "#/components/schemas/authentication_error_response"

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

      response "401", "missing required login parameters" do
        schema "$ref" => "#/components/schemas/authentication_error_response"

        let(:payload) { {} }
        run_test!
      end
    end
  end

  path "/api/v1/users/logout" do
    delete "Logs out a user from their active authenticated session" do
      tags "Users"
      produces "application/json"
      security [ cookie_auth: [] ]

      parameter name: "Cookie",
              in: :header,
              type: :string,
              required: true

      response "200", "logged out user successfully" do
        schema "$ref" => "#/components/schemas/empty_success_response"

        let!(:user) { create(:user) }

        let(:auth_token) do
          post api_path("/users/login"), params: {
            user: {
              email: user.email,
              password: "password"
            }
          },
          as: :json
          response.cookies["jwt_token"]
        end

        let(:Cookie) { "jwt_token=#{auth_token}" }


        run_test!
      end

      response "401", "invalid active session" do
        schema "$ref" => "#/components/schemas/authentication_error_response"
        let(:Cookie) { "jwt_token=not-a-token" }

        run_test!
      end
    end
  end
end
