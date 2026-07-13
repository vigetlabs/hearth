require "rails_helper"

RSpec.describe "Api::V1::Visits::Visits", type: :request do
  describe "POST /visits" do
    let(:office) { create(:office) }
    let(:user) { create(:user) }
    let(:headers) { auth_headers_for(user) }

    let(:valid_params) do
      {
        visits: [
          {
            office_id: office.id,
            visit_date: "2026-07-13"
          },
          {
            office_id: office.id,
            visit_date: "2026-07-14"
          }
        ]
      }
    end

    subject(:create_visits) do
      post api_path("/visits"),
        params: valid_params,
        headers: headers,
        as: :json
    end

    context "with valid params" do
      it "creates the visits" do
        expect { create_visits }
          .to change(Visit, :count).by(2)
      end

      it "creates the visits for the authenticated user" do
        create_visits

        created_visits = user.visits.order(:visit_date)

        expect(created_visits.pluck(:visit_date)).to eq(
          [
            Date.new(2026, 7, 13),
            Date.new(2026, 7, 14)
          ]
        )
      end

      it "associates the visits with the requested office" do
        create_visits

        expect(user.visits.pluck(:office_id))
          .to contain_exactly(office.id, office.id)
      end

      it "returns a created response" do
        create_visits

        expect(response).to have_http_status(:created)
      end

      it "returns JSON" do
        create_visits

        expect(response.media_type).to eq("application/json")
      end
    end
  end
end
