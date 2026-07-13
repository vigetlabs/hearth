require "swagger_helper"

RSpec.describe "Api::V1::Users::Registrations", type: :request do
  path "/api/v1/users" do
    post "Creates a user account" do
      tags "Users"
      consumes "application/json"
      produces "application/json"

      parameter name: :payload,
        in: :body,
        required: true,
        schema: { "$ref" => "#/components/schemas/create_user_request" }

      response "201", "user created successfully" do
        schema "$ref" => "#/components/schemas/user_response"

          let(:payload) do
            {
              user: {
                email: "user@example.com",
                first_name: "Ryan",
                last_name: "Dioneda",
                password: "password",
                password_confirmation: "password"
              }
            }
          end

          run_test!
      end

      response "400", "missing user parameter" do
        schema "$ref" => "#/components/schemas/bad_request_error_response"

        let(:payload) do
          {
            email: "user@example.com",
            password: "password"
          }
        end

        run_test!
      end

      response "422", "invalid user params" do
        schema "$ref" => "#/components/schemas/validation_error_response"

        let(:payload) do
          {
            user: {
              email: "",
              first_name: "",
              last_name: "",
              password: "password",
              password_confirmation: "different"
            }
          }
        end

        run_test!
      end
    end
  end
end
