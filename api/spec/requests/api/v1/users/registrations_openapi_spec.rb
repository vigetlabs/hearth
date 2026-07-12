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
        schema: { "$ref" => "#/components/schemas/create_user_request" }

      response "201", "user created successfully" do
        # SUCCESS RESPONSE SCHEMA
        schema "$ref" => "#/components/schemas/user_response"

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
