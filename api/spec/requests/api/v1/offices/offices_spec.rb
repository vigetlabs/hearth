require "rails_helper"

RSpec.describe "Api::V1::Offices::Offices", type: :request do
  describe "GET /api/v1/offices" do
    let!(:boulder_office) do
      create(
        :office,
        name: "Boulder",
        city: "Boulder",
        state: "CO",
        timezone: "America/Denver",
        emoji: "🏔️"
      )
    end

    let!(:arlington_office) do
      create(
        :office,
        name: "Arlington",
        city: "Arlington",
        state: "VA",
        timezone: "America/New_York",
        emoji: "🏛️"
      )
    end

    it "returns all offices ordered by name" do
      get "/api/v1/offices"

      expect(response).to have_http_status(:ok)

      response_body = response.parsed_body
      offices = response_body.dig("data", "offices")

      expect(response_body).to include(
        "status" => {
          "code" => 200,
          "message" => "Fetched offices successfully"
        }
      )

      expect(offices).to eq(
        [
          {
            "id" => arlington_office.id,
            "name" => arlington_office.name,
            "city" => arlington_office.city,
            "state" => arlington_office.state,
            "timezone" => arlington_office.timezone,
            "emoji" => arlington_office.emoji
          },
          {
            "id" => boulder_office.id,
            "name" => boulder_office.name,
            "city" => boulder_office.city,
            "state" => boulder_office.state,
            "timezone" => boulder_office.timezone,
            "emoji" => boulder_office.emoji
          }
        ]
      )
    end

    context "when no offices exist" do
      before do
        Office.delete_all
      end

      it "returns an empty offices array" do
        get "/api/v1/offices"

        expect(response).to have_http_status(:ok)

        expect(response.parsed_body).to include(
          "status" => {
            "code" => 200,
            "message" => "Fetched offices successfully"
          },
          "data" => {
            "offices" => []
          }
        )
      end
    end
  end
end
