require "swagger_helper"

RSpec.describe "Api::V1::AttendanceConfirmations::AttendanceConfirmations", type: :request do
  path "/api/v1/attendance_confirmations" do
    get "Fetch attendance confirmations" do
      tags "Attendance Confirmations"
      produces "application/json"
      security [ cookie_auth: [] ]

      parameter(
        name: :office_id,
        in: :query,
        required: true,
        schema: {
          type: :integer
        },
        description: "The office whose confirmations should be returned."
      )

      parameter(
        name: :starts_on,
        in: :query,
        required: true,
        schema: {
          type: :string,
          format: :date
        },
        description: <<~DESCRIPTION.squish
          Any date within the requested week. The API normalizes this value
          to the Monday of that week.
        DESCRIPTION
      )

      response "200", "attendance confirmations fetched successfully" do
        schema "$ref" =>
          "#/components/schemas/attendance_confirmations_response"

        let(:user) { create(:user) }
        let(:office) { create(:office) }
        let(:office_id) { office.id }
        let(:starts_on) { "2026-07-16" }

        before do
          sign_in user
        end

        run_test!
      end

      response "400", "required parameter is missing" do
        schema "$ref" =>
          "#/components/schemas/bad_request_error_response"

        let(:user) { create(:user) }
        let(:office_id) { nil }
        let(:starts_on) { "2026-07-16" }

        before do
          sign_in user
        end

        run_test!
      end

      response "400", "parameter has an invalid format" do
        schema "$ref" =>
          "#/components/schemas/bad_request_error_response"

        let(:user) { create(:user) }
        let(:office_id) { "invalid" }
        let(:starts_on) { "2026-07-16" }

        before do
          sign_in user
        end

        run_test!
      end

      response "401", "authentication is required" do
        schema "$ref" =>
          "#/components/schemas/authentication_error_response"

        let(:office) { create(:office) }
        let(:office_id) { office.id }
        let(:starts_on) { "2026-07-16" }

        run_test!
      end

      response "404", "office was not found" do
        schema "$ref" =>
          "#/components/schemas/not_found_error_response"

        let(:user) { create(:user) }
        let(:office_id) { -1 }
        let(:starts_on) { "2026-07-16" }

        before do
          sign_in user
        end

        run_test!
      end
    end

    post "Confirm attendance for a week" do
      tags "Attendance Confirmations"
      consumes "application/json"
      produces "application/json"
      security [ cookie_auth: [] ]

      parameter name: :attendance_confirmation,
        in: :body,
        required: true,
        schema: { "$ref" => "#/components/schemas/create_attendance_confirmation_request" }

      response "200", "attendance confirmed successfully" do
        schema "$ref" =>
          "#/components/schemas/create_attendance_confirmation_response"

        let(:user) { create(:user) }
        let(:office) { create(:office) }

        let(:attendance_confirmation) do
          {
            office_id: office.id,
            starts_on: "2026-07-16",
            selected_dates: [
              "2026-07-14",
              "2026-07-16"
            ]
          }
        end

        before do
          sign_in user
        end

        run_test!
      end

      response "400", "required parameter is missing" do
        schema "$ref" =>
          "#/components/schemas/bad_request_error_response"

        let(:user) { create(:user) }

        let(:attendance_confirmation) do
          {
            starts_on: "2026-07-16",
            selected_dates: [ "2026-07-16" ]
          }
        end

        before do
          sign_in user
        end

        run_test!
      end

      response "400", "request contains invalid selected dates" do
        schema "$ref" =>
          "#/components/schemas/bad_request_error_response"

        let(:user) { create(:user) }
        let(:office) { create(:office) }

        let(:attendance_confirmation) do
          {
            office_id: office.id,
            starts_on: "2026-07-16",
            selected_dates: [
              "2026-07-16",
              "invalid"
            ]
          }
        end

        before do
          sign_in user
        end

        run_test!
      end

      response "401", "authentication is required" do
        schema "$ref" =>
          "#/components/schemas/authentication_error_response"

        let(:office) { create(:office) }

        let(:attendance_confirmation) do
          {
            office_id: office.id,
            starts_on: "2026-07-16",
            selected_dates: [ "2026-07-16" ]
          }
        end

        run_test!
      end

      response "404", "office was not found" do
        schema "$ref" =>
          "#/components/schemas/not_found_error_response"

        let(:user) { create(:user) }

        let(:attendance_confirmation) do
          {
            office_id: -1,
            starts_on: "2026-07-16",
            selected_dates: [ "2026-07-16" ]
          }
        end

        before do
          sign_in user
        end

        run_test!
      end
    end
  end
end
