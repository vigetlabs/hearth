require "swagger_helper"

RSpec.describe "Api::V1::Offices::Offices", type: :request do
  path "/api/v1/offices" do
    get "Fetches all offices" do
      tags "Offices"
      produces "application/json"

      response "200", "offices fetched successfully" do
        schema "$ref" => "#/components/schemas/offices_response"

        let!(:office) { create(:office) }

        run_test!
      end
    end
  end
end
