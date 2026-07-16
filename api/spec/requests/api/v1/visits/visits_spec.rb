require "rails_helper"

RSpec.describe "Api::V1::Visits::Visits", type: :request do
  describe "GET /visits" do
    let!(:user) { create(:user) }
    let!(:office) { create(:office) }
    let(:headers) { auth_headers_for(user) }

    let(:query_params) do
      {
        date: "2026-07-15",
        view: "week",
        office_id: office.id
      }
    end

    subject(:get_visits) do
      get api_path("/visits"),
        params: query_params,
        headers: headers
    end

    context "when the user is authenticated" do
      context "with an invalid date format" do
        let(:query_params) do
          {
            date: "not-a-date",
            view: "week",
            office_id: office.id
          }
        end

        it "returns a bad request response" do
          get_visits
          expect(response).to have_http_status(:bad_request)
        end

        it "returns the invalid-date message" do
          get_visits
          json = JSON.parse(response.body)
          msg = get_error_message(json)
          expect(msg).to eq("Invalid date")
        end
      end

      context "with a non-existent date" do
        let(:query_params) do
          {
            date: "2026-02-80",
            view: "week",
            office_id: office.id
          }
        end

        it "returns a bad request response" do
          get_visits
          expect(response).to have_http_status(:bad_request)
        end

        it "returns the invalid-date message" do
          get_visits
          json = JSON.parse(response.body)
          msg = get_error_message(json)
          expect(msg).to eq("Invalid date")
        end

        it "returns the bad request api error code" do
          get_visits
          json = JSON.parse(response.body)

          expect(get_error_code(json))
            .to eq(ApiErrorCodes::BadRequest::BAD_REQUEST)
        end

        it "returns the bad request api error type" do
          get_visits
          json = JSON.parse(response.body)

          expect(get_error_type(json))
            .to eq(ApiErrorTypes::BAD_REQUEST)
        end
      end

      context "when date and view are not provided" do
        let(:query_params) do
          {
            office_id: office.id
          }
        end

        let!(:visits_in_range) do
          [
            create(
              :visit,
              user: user,
              office: office,
              visit_date: Date.current
            ),
            create(
              :visit,
              office: office,
              visit_date: Date.current.beginning_of_week(:sunday)
            )
          ]
        end

        let!(:visit_out_range) do
          create(
            :visit,
            user: user,
            office: office,
            visit_date: Date.current.end_of_week(:sunday) + 1.day
          )
        end

        it "uses the current date and week view defaults" do
          get_visits

          expect(response).to have_http_status(:ok)

          json = JSON.parse(response.body)
          expect(json["data"]["visits"].size).to eq(2)
        end
      end

      context "when the calendar view is invalid" do
        let(:query_params) do
          {
            date: "2026-07-15",
            view: "month",
            office_id: office.id
          }
        end

        it "returns a bad request response" do
          get_visits
          expect(response).to have_http_status(:bad_request)
        end

        it "returns the invalid-view message" do
          get_visits
          json = JSON.parse(response.body)
          msg = get_error_message(json)
          expect(msg).to eq("Invalid calendar view")
        end
      end

      context "when the office ID is missing" do
        let(:query_params) do
          {
            date: "2026-07-15",
            view: "week"
          }
        end

        it "returns a bad request response" do
          get_visits
          expect(response).to have_http_status(:bad_request)
        end

        it "returns a missing parameter error" do
          get_visits
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

      context "when the office ID is not an integer" do
        let(:query_params) do
          {
            date: "2026-07-15",
            view: "week",
            office_id: "not-an-integer"
          }
        end

        it "returns a bad request response" do
          get_visits
          expect(response).to have_http_status(:bad_request)
        end

        it "returns the invalid-office-ID message" do
          get_visits
          json = JSON.parse(response.body)
          msg = get_error_message(json)

          expect(msg).to eq("Invalid office ID")
        end

        it "returns a bad request error" do
          get_visits
          json = JSON.parse(response.body)

          expect(json).to include(
            "status" => include(
              "code" => 400
            ),
            "error" => include(
              "type" => ApiErrorTypes::BAD_REQUEST,
              "code" => ApiErrorCodes::BadRequest::BAD_REQUEST
            )
          )
        end
      end

      context "with valid query parameters" do
        context "when visits exist in the requested week" do
          let!(:visits_in_range) do
            [
              create(
                :visit,
                user: user,
                office: office,
                visit_date: "2026-07-15"
              ),
              create(
                :visit,
                user: user,
                office: office,
                visit_date: "2026-07-16"
              )
            ]
          end

          it "returns the visits" do
            get_visits
            expect(response).to have_http_status(:ok)

            json = JSON.parse(response.body)
            visits = json["data"]["visits"]

            expect(visits).to contain_exactly(
              hash_including(
                "id" => visits_in_range[0].id,
                "visit_date" => "2026-07-15"
              ),
              hash_including(
                "id" => visits_in_range[1].id,
                "visit_date" => "2026-07-16"
              )
            )
          end
        end

        context "when visits have different statuses" do
          let!(:planned_visit) do
            create(
              :visit,
              user: user,
              office: office,
              visit_date: "2026-07-15",
              status: "planned"
            )
          end

          let!(:confirmed_visit) do
            create(
              :visit,
              user: user,
              office: office,
              visit_date: "2026-07-16",
              status: "confirmed"
            )
          end

          it "returns the planned status" do
            get_visits

            json = JSON.parse(response.body)
            visit = json["data"]["visits"].find do |item|
              item["id"] == planned_visit.id
            end

            expect(visit).to include(
              "status" => "planned"
            )
          end

          it "returns the confirmed status" do
            get_visits

            json = JSON.parse(response.body)
            visit = json["data"]["visits"].find do |item|
              item["id"] == confirmed_visit.id
            end

            expect(visit).to include(
              "status" => "confirmed"
            )
          end

          it "returns each visit with its corresponding status" do
            get_visits

            json = JSON.parse(response.body)
            visits = json["data"]["visits"]

            expect(visits).to contain_exactly(
              hash_including(
                "id" => planned_visit.id,
                "status" => "planned"
              ),
              hash_including(
                "id" => confirmed_visit.id,
                "status" => "confirmed"
              )
            )
          end
        end

        context "when visits exist outside the requested week" do
          let!(:visit_outside_range) do
            create(
              :visit,
              user: user,
              office: office,
              visit_date: "2026-07-25"
            )
          end

          it "does not return those visits" do
            get_visits
            json = JSON.parse(response.body)
            visit_ids = json["data"]["visits"].pluck("id")

            expect(visit_ids).not_to include(visit_outside_range.id)
          end
        end

        context "when visits exist at another office" do
          let!(:another_office) { create(:office) }

          let!(:requested_office_visit) do
            create(
              :visit,
              user: user,
              office: office,
              visit_date: "2026-07-16"
            )
          end

          let!(:another_office_visit) do
            create(
              :visit,
              office: another_office,
              visit_date: "2026-07-16"
            )
          end

          it "returns only visits for the requested office" do
            get_visits

            json = JSON.parse(response.body)
            visits = json["data"]["visits"]

            expect(visits).to contain_exactly(
              hash_including(
                "id" => requested_office_visit.id,
                "office_id" => office.id
              )
            )

            expect(visits.pluck("id"))
              .not_to include(another_office_visit.id)
          end
        end

        context "when another user has visits in the requested week" do
          let!(:another_users_visit) do
            create(
              :visit,
              office: office,
              visit_date: "2026-07-16"
            )
          end

          let!(:users_visit) do
            create(
              :visit,
              user: user,
              office: office,
              visit_date: "2026-07-16"
            )
          end

          it "returns all visits for the requested office" do
            get_visits
            json = JSON.parse(response.body)
            visits = json["data"]["visits"]

            expect(visits).to contain_exactly(
              hash_including(
                "id" => another_users_visit.id,
                "visit_date" => "2026-07-16",
                "user" => hash_including(
                  "id" => another_users_visit.user.id
                )
              ),
              hash_including(
                "id" => users_visit.id,
                "visit_date" => "2026-07-16",
                "user" => hash_including(
                  "id" => user.id
                )
              )
            )
          end
        end
      end
    end
  end
end
