require "rails_helper"

RSpec.describe "Api::V1::Schedules::Schedules", type: :request do
  describe "POST /schedules" do
    subject(:create_schedule) do
      post api_path("/schedules"),
        params: params,
        headers: headers,
        as: :json
    end

    let!(:user) { create(:user) }
    let(:headers) { auth_headers_for(user) }

    let(:params) do
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

    context "when the user is authorized" do
      context "with valid parameters" do
        it "creates a schedule" do
          expect { create_schedule }
            .to change(Schedule, :count).by(1)
        end

        it "creates the schedule for the authenticated user" do
          create_schedule

          schedule = Schedule.order(:created_at).last

          expect(schedule.user).to eq(user)
        end

        it "stores the provided schedule attributes" do
          create_schedule

          schedule = Schedule.order(:created_at).last

          expect(schedule).to have_attributes(
            is_default: true,
            monday: true,
            tuesday: false,
            wednesday: false,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false
          )
        end

        it "returns a created response" do
          create_schedule

          expect(response).to have_http_status(:created)
        end

        it "returns JSON" do
          create_schedule

          expect(response.media_type).to eq("application/json")
        end

        it "returns the created schedule" do
          create_schedule

          json = JSON.parse(response.body)
          schedule = Schedule.order(:created_at).last

          expect(json["data"]["schedule"]).to include(
            "id" => schedule.id,
            "is_default" => true,
            "monday" => true,
            "tuesday" => false,
            "wednesday" => false,
            "thursday" => true,
            "friday" => true,
            "saturday" => false,
            "sunday" => false
          )
        end
      end

      context "with invalid parameters" do
        let(:params) do
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

        it "does not create a schedule" do
          expect { create_schedule }
            .not_to change(Schedule, :count)
        end

        it "returns an unprocessable content response" do
          create_schedule

          expect(response).to have_http_status(:unprocessable_content)
        end

        it "returns a validation error" do
          create_schedule

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
          create_schedule

          json = JSON.parse(response.body)
          details = json["error"]["details"]

          expect(details).to include(
            hash_including("field" => "monday")
          )
        end
      end

      context "when the schedule parameter is missing" do
        let(:params) { {} }

        it "does not create a schedule" do
          expect { create_schedule }
            .not_to change(Schedule, :count)
        end

        it "returns a bad request response" do
          create_schedule

          expect(response).to have_http_status(:bad_request)
        end

        it "returns the missing parameter error code" do
          create_schedule

          json = JSON.parse(response.body)

          expect(json["error"]["code"])
            .to eq(ApiErrorCodes::BadRequest::MISSING_PARAMETER)
        end
      end
    end

    context "when the user is not authorized" do
      let(:headers) { {} }

      it "does not create a schedule" do
        expect { create_schedule }
          .not_to change(Schedule, :count)
      end

      it "returns an unauthorized response" do
        create_schedule

        expect(response).to have_http_status(:unauthorized)
      end

      it "returns an authentication error" do
        create_schedule

        json = JSON.parse(response.body)

        expect(json).to include(
          "status" => include(
            "code" => 401
          ),
          "error" => include(
            "type" => ApiErrorTypes::AUTHENTICATION
          )
        )
      end
    end
  end
end
