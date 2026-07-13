require 'rails_helper'

RSpec.describe "Api::V1::Visits::Visits", type: :request do
  describe "POST /visits" do
    let(:office) { create(:office) }
    let(:valid_params) do
      {
        visits: [
          {
            "office_id": office.id,
            "visit_date": "2026-7-13"
          },
          {
            "office_id": office.id,
            "visit_date": "2026-7-14"
          }
        ]
      }

      context "with valid params" do
        it "creates visits" do
          expect do
            post api_path("/visits"), params: valid_params
          end.to change(Visit, :count).by(2)
        end
      end
    end
  end
end
