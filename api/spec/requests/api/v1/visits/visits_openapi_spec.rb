require "swagger_helper"

RSpec.describe "Api::V1::Visits::Visits", type: :request do
  path "/api/v1/visits" do
    post "Creates user visits"  do
      tags "Visits"
      consumes "application/json"
      produces "application/json"

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
    end
  end
end
