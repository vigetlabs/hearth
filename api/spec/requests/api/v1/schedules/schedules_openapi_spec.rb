require "swagger_helper"

RSpec.describe "Api::V1::Schedules::Schedules", type: :request do
  path "/api/v1/schedules/default" do
    get "Fetches the current user's default schedule" do
      tags "Schedules"
      produces "application/json"
      security [ cookie_auth: [] ]

      response "200", "fetched default schedule successfully" do
        schema "$ref" => "#/components/schemas/schedule_response"

        let!(:user) { create(:user) }
        let!(:def_schedule) { create(:schedule, user: user) }

        before do
          sign_in user
        end

        run_test!
      end

      response "401", "authentication required" do
        schema "$ref" =>
          "#/components/schemas/authentication_error_response"

          run_test!
      end
    end
  end

  path "/api/v1/schedules" do
    post "Creates a schedule" do
      tags "Schedules"
      consumes "application/json"
      produces "application/json"
      security [ cookie_auth: [] ]

      parameter name: :payload,
        in: :body,
        required: true,
        schema: {
          "$ref" => "#/components/schemas/create_schedule_request"
        }

      response "201", "schedule created successfully" do
        schema "$ref" => "#/components/schemas/schedule_response"

        let!(:user) { create(:user) }

        before do
          sign_in user
        end

        let(:payload) do
          {
            schedule: {
              is_default: true,
              monday: true,
              tuesday: false,
              wednesday: false,
              thursday: true,
              friday: true,
              saturday: false,
              sunday: false
            }
          }
        end

        run_test!
      end

      response "422", "invalid schedule parameters" do
        schema "$ref" =>
          "#/components/schemas/validation_error_response"

        let!(:user) { create(:user) }

        before do
          sign_in user
        end

        let(:payload) do
          {
            schedule: {
              is_default: true,
              monday: nil,
              tuesday: false,
              wednesday: false,
              thursday: true,
              friday: true,
              saturday: false,
              sunday: false
            }
          }
        end

        run_test!
      end

      response "400", "missing schedule parameter" do
        schema "$ref" =>
          "#/components/schemas/bad_request_error_response"

        let!(:user) { create(:user) }

        before do
          sign_in user
        end

        let(:payload) { {} }

        run_test!
      end

      response "401", "authentication required" do
        schema "$ref" =>
          "#/components/schemas/authentication_error_response"

        let(:payload) do
          {
            schedule: {
              is_default: true,
              monday: true,
              tuesday: false,
              wednesday: false,
              thursday: true,
              friday: true,
              saturday: false,
              sunday: false
            }
          }
        end

        run_test!
      end
    end
  end
end
