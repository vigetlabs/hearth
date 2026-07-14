require "rails_helper"

RSpec.describe "Api::V1::Visits::Visits", type: :request do
  describe "POST /visits" do
    let!(:office) { create(:office) }
    let!(:user) { create(:user) }
    let(:params) do
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
    let(:headers) { auth_headers_for(user) }

    subject(:create_visits) do
      post api_path("/visits"),
        params: params,
        headers: headers,
        as: :json
    end

    context "when the user is authorized" do
      context "with valid parameters" do
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

      context "with invalid parameters" do
        let(:params) do
          {
            visits: [
              {
                office_id: office.id.to_s,
                visit_date: nil
              },
              {
                office_id: office.id.to_s,
                visit_date: nil
              }
            ]
          }
        end

        it "does not create visits" do
          expect { create_visits }
            .not_to change(Visit, :count)
        end

        it "returns an unprocessable content response" do
          create_visits
          expect(response).to have_http_status(:unprocessable_content)
        end

        it "returns a validation error" do
          create_visits

          json = JSON.parse(response.body)
          expect(json).to include(
            "status" => include(
              "code" => 422
            ),
            "error" => include(
              "type" => ApiErrorTypes::VALIDATION,
              "code" => ApiErrorCodes::Validation::INVALID_ATTRIBUTES
            )
          )
        end

        it "includes details for the invalid field" do
          create_visits

          json = JSON.parse(response.body)
          details = get_error_details(json)
          expect(details).to include(
            hash_including("field" => "visit_date")
          )
        end
      end

      context "when the visits parameter is missing" do
        let(:params) { {} }

        it "does not create a schedule" do
          expect { create_visits }
            .not_to change(Schedule, :count)
        end

        it "returns a bad request response" do
          create_visits
          expect(response).to have_http_status(:bad_request)
        end

        it "returns a bad request error" do
          create_visits
          json = JSON.parse(response.body)
          expect(json).to include(
            "status" => include(
              "code" => 400
            ),
            "error" => include(
              "type" => ApiErrorTypes::BAD_REQUEST,
              "code" => ApiErrorCodes::BadRequest::MISSING_PARAMETER
            )
          )
        end
      end
    end
  end
end
