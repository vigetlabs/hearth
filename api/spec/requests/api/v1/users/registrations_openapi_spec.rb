require "swagger_helper"

RSpec.describe "Api::V1::Users::Registrations", type: :request do
  path "/api/v1/users" do
    post "Creates a user account" do
      tags "Users"
      consumes "application/json"
      produces "application/json"

      # REQUEST BODY
      parameter name: :payload,
        in: :body,
        required: true,
        schema: OpenApi::Schemas::V1::Users::CREATE_USER_REQUEST

      response "201", "user created successfully" do
        # SUCCESS RESPONSE SCHEMA
        schema OpenApi::Schemas::V1::Users::USER_RESPONSE

          # INPUT DATA TO TEST `200` CASE
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

      response "422", "invalid user params" do
        schema OpenApi::Schemas::V1::Errors::VALIDATION_ERROR_RESPONSE

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
