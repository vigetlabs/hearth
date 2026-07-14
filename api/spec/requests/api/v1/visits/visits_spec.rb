require "rails_helper"

RSpec.describe "Api::V1::Visits::Visits", type: :request do
  describe "GET /visits" do
    let!(:user) { create(:user) }
    let!(:office) { create(:office) }
    let(:headers) { auth_headers_for(user) }

    let(:query_params) do
      {
        date: "2026-07-15",
        view: "week"
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
            view: "week"
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
            view: "week"
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
          expect(get_error_code(json)).to eq(ApiErrorCodes::BadRequest::BAD_REQUEST)
        end

        it "returns the bad request api error code" do
          get_visits
          json = JSON.parse(response.body)
          expect(get_error_type(json)).to eq(ApiErrorTypes::BAD_REQUEST)
        end
      end

      context "when no query params" do
        let(:query_params) { {} }

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

        let!(:visit_out_range) do
          create(
            :visit,
            user: user,
            office: office,
            visit_date: "2026-07-22"
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
            view: "month"
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
            visit_id = json["data"]["visits"]
            expect(visit_id).not_to include(visit_outside_range.id)
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

          let!(:users_vist) do
            create(
              :visit,
              user: user,
              office: office,
              visit_date: "2026-07-16"
            )
          end

          it "returns all visits" do
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
                "id" => users_vist.id,
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

    context "when the user is authenticated" do
      context "with valid parameters" do
        context "when no visits exist for the requested dates" do
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

        context "when a visit already exists for a requested date" do
          let!(:existing_visit) do
            create(
              :visit,
              user: user,
              office: office,
              visit_date: "2026-07-13"
            )
          end

          let!(:new_office) { create(:office) }

          let(:params) do
            {
              visits: [
                {
                  office_id: new_office.id,
                  visit_date: "2026-07-13"
                }
              ]
            }
          end

          it "does not create another visit" do
            expect { create_visits }
              .not_to change(Visit, :count)
          end

          it "updates the existing visit's office" do
            create_visits
            expect(existing_visit.reload.office).to eq(new_office)
          end
        end
      end

      context "with invalid parameters" do
        let(:params) do
          {
            visits: [
              {
                office_id: office.id,
                visit_date: nil
              },
              {
                office_id: office.id,
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

        it "does not create visits" do
          expect { create_visits }
            .not_to change(Visit, :count)
        end

        it "returns a bad request response" do
          create_visits

          expect(response).to have_http_status(:bad_request)
        end

        it "returns a missing parameter error" do
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

    context "when the user is not authenticated" do
      let(:headers) { {} }

      it "does not create visits" do
        expect { create_visits }
          .not_to change(Visit, :count)
      end

      it "returns an unauthorized response" do
        create_visits

        expect(response).to have_http_status(:unauthorized)
      end

      it "returns an authentication error" do
        create_visits

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
