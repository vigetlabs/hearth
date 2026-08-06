require "swagger_helper"

RSpec.describe "Api::V1::Visits::Visits", type: :request do
  path "/api/v1/visits/relevant" do
    get "Retrieves the relevant visits based on office and calendar week range" do
      tags "Visits"
      produces "Application/json"
      security [ cookie_auth: [] ]

      parameter name: :office_id,
        in: :query,
        type: :integer,
        required: true,
        description: "The id of the active office being viewed in calendar page"

      parameter name: :date,
        in: :query,
        required: false,
        schema: { "$ref" => "#/components/schemas/visit_date" },
        description: "Anchor date for the calendar range. Defaults to the current date."

      parameter name: :view,
        in: :query,
        required: false,
        schema: {
          type: :string,
          enum: %w[week],
          default: "week"
        },
        description: "Calendar view used to calculate the returned range."

      response "200", "relevant visits retrieved successfully" do
        schema "$ref" => "#/components/schemas/visits_response"

        let(:user) { create(:user) }
        let(:office_id) { user.office_id }
        let(:date) { Date.current.to_s }
        let(:view) { "week" }

        before do
          sign_in user
        end

        run_test!
      end

      response "400", "invalid query parameters" do
        schema "$ref" => "#/components/schemas/bad_request_error_response"

        let(:user) { create(:user) }
        let(:office_id) { user.office_id }
        let(:date) { "invalid-date" }
        let(:view) { "week" }

        before do
          sign_in user
        end

        run_test!
      end

      response "401", "authentication required" do
        schema "$ref" => "#/components/schemas/authentication_error_response"
        let(:user) { create(:user) }
        let(:office_id) { user.office_id }
        let(:date) { Date.current.to_s }
        let(:view) { "week" }

        run_test!
      end
    end
  end

  path "/api/v1/visits/mine" do
    get "Retrieves the authenticated user's visits for a calendar range" do
      tags "Visits"
      produces "Application/json"
      security [ cookie_auth: [] ]

      parameter name: :date,
        in: :query,
        required: false,
        schema: { "$ref" => "#/components/schemas/visit_date" },
        description: "Anchor date for the calendar range. Defaults to the current date."

      parameter name: :view,
        in: :query,
        required: false,
        schema: {
          type: :string,
          enum: %w[week],
          default: "week"
        },
        description: "Calendar view used to calculate the returned range."

      response "200", "user visits fetched successfully" do
        schema "$ref" => "#/components/schemas/visits_response"

        let(:user) { create(:user) }
        let(:date) { "2026-07-21" }
        let(:view) { "week" }

        before do
          sign_in user
        end

        run_test!
      end

      response "400", "invalid query parameters" do
        schema "$ref" => "#/components/schemas/bad_request_error_response"

        let(:user) { create(:user) }
        let(:date) { "invalid-date" }
        let(:view) { "year" }

        before do
          sign_in user
        end

        run_test!
      end

      response "401", "authentication required" do
        schema "$ref" => "#/components/schemas/authentication_error_response"

        let(:date) { "2026-07-15" }
        let(:view) { "week" }

        run_test!
      end
    end
  end

  path "/api/v1/visits" do
    get "Retrieves visits for a calendar range" do
      tags "Visits"
      produces "application/json"
      security [ cookie_auth: [] ]

      parameter name: :date,
        in: :query,
        required: false,
        schema: { "$ref" => "#/components/schemas/visit_date" },
        description: "Anchor date for the calendar range. Defaults to the current date."

      parameter name: :view,
        in: :query,
        required: false,
        schema: {
          type: :string,
          enum: %w[week],
          default: "week"
        },
        description: "Calendar view used to calculate the returned range."

      parameter name: :office_id,
        in: :query,
        required: true,
        schema: {
          type: :integer
        },
        description: "ID of the office whose visits should be returned."

      response "200", "visits fetched successfully" do
        schema "$ref" => "#/components/schemas/visits_response"

        let(:user) { create(:user) }
        let(:office) { create(:office) }
        let(:office_id) { office.id }
        let(:date) { "2026-07-15" }
        let(:view) { "week" }

        before do
          sign_in user
        end
      end

      response "400", "invalid query parameters" do
        schema "$ref" =>
          "#/components/schemas/bad_request_error_response"

        let(:user) { create(:user) }
        let(:office) { create(:office) }
        let(:office_id) { office.id }
        let(:date) { "invalid-date" }
        let(:view) { "year" }

        before do
          sign_in user
        end

        run_test!
      end

      response "401", "authentication required" do
        schema "$ref" =>
          "#/components/schemas/authentication_error_response"

        let(:office) { create(:office) }
        let(:office_id) { office.id }
        let(:date) { "2026-07-15" }
        let(:view) { "week" }

        run_test!
      end
    end


    post "Creates user visits"  do
      tags "Visits"
      consumes "application/json"
      produces "application/json"
      security [ cookie_auth: [] ]

      parameter name: :payload,
        in: :body,
        required: true,
        schema: { "$ref" => "#/components/schemas/create_visits_request" }

      response "201", "visits created successfully" do
        schema "$ref" => "#/components/schemas/visits_response"
        let(:user) { create(:user) }
        let(:office) { create(:office) }
        before do
          sign_in user
        end

        let(:payload) do
          {
            visits: [
              {
                visit_date: "2026-07-13",
                office_id: office.id
              },
              {
                visit_date: "2026-07-14",
                office_id: office.id
              }
            ]
          }
        end

        run_test!
      end

      response "400", "missing visits parameter" do
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

        let(:office) { create(:office) }
        let(:payload) do
          {
            visits: [
              {
                visit_date: "2026-07-13",
                office_id: office.id
              },
              {
                visit_date: "2026-07-14",
                office_id: office.id
              }
            ]
          }
        end

        run_test!
      end

      response "422", "invalid visits parameters" do
        schema "$ref" =>
          "#/components/schemas/validation_error_response"

        let!(:user) { create(:user) }
        let!(:office) { create(:office) }

        before do
          sign_in user
        end

        let(:payload) do
          {
            visits: [
              {
                office_id: office.id,
                vist_date: nil
              },
              {
                office_id: office.id,
                vist_date: nil
              }
            ]
          }
        end

        run_test!
      end
    end
  end
end
