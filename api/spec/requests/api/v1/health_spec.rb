require "rails_helper"

RSpec.describe "Api::V1::Health", type: :request do
  describe "GET /api/v1/health" do
    it "returns ok status" do
      get api_path("/health")

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq("status" => "ok")
    end
  end
end
