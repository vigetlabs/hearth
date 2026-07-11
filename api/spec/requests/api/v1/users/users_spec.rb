require "rails_helper"

RSpec.describe "Api::V1::Users::Users", type: :request do
  let(:office) { create(:office) }
  let(:user) { create(:user, office: office) }
  let(:headers) { auth_headers_for(user) }

  describe "PATCH /users/me" do
    context "when the user is authorized" do
      context "with valid parameters" do
        it "updates the user's name" do
          patch api_path("/users/me"),
            params: {
              user: {
                first_name: "Sam",
                last_name: "Brothers"
              }
            },
            headers: auth_headers_for(user),
            as: :json

            expect(response).to have_http_status(:ok)
            expect(user.reload).to have_attributes(
              first_name: "Sam",
              last_name: "Brothers"
            )
        end

        it "updates the user's office" do
          new_office = create(:office)
          patch api_path("/users/me"),
            params: {
              user: {
                office_id: new_office.id
              }
            },
            headers: auth_headers_for(user),
            as: :json

            expect(response).to have_http_status(:ok)
            expect(user.reload.office).to eq(new_office)
        end

        it "removes the user's office" do
          office = create(:office)
          user.update!(office: office)

          patch api_path("/users/me"),
            params: {
              user: {
                office_id: nil
              }
            },
            headers: auth_headers_for(user),
            as: :json

            expect(response).to have_http_status(:ok)
            expect(user.reload.office).to be_nil
        end
      end
    end
  end

  describe "GET /users/me" do
    context "when the user is authorized" do
      context "when the user belongs to an office" do
        it "returns the user's information" do
          get api_path("/users/me"), headers: headers

          expect(response).to have_http_status(:ok)
          json = JSON.parse(response.body)
          user_data = json["data"]["user"]

          # @TODO: Add default_schedule and lab once integrated
          expect(user_data).to include(
            "email" => user.email,
            "first_name"=> user.first_name,
            "last_name" => user.last_name,
            "office_id" => office.id
          )
        end
      end

      context "when the user does not belong to an office" do
        let(:office) { nil }

        it "returns a null office_id" do
          get api_path("/users/me"), headers: headers

          expect(response).to have_http_status(:ok)

          user_data = response.parsed_body.dig("data", "user")

          expect(user_data).to include(
            "email" => user.email,
            "first_name" => user.first_name,
            "last_name" => user.last_name,
            "office_id" => nil
          )
        end
      end
    end

    context "when the user is not authorized" do
      context "when the request has no authentication cookie" do
        it "returns unauthorized" do
          get api_path("/users/me")

          expect(response).to have_http_status(:unauthorized)
        end
      end

      context "when the jwt token is invalid" do
        it "returns unauthorized" do
          get api_path("/users/me"), headers: {
            "Cookie" => "jwt_token=bad-token"
          }

          expect(response).to have_http_status(:unauthorized)
        end
      end

      context "when the jwt_token cookie is missing" do
        it "returns unauthorized" do
          get api_path("/users/me"), headers: {
            "Cookie" => "some_other_cookie=value"
          }

          expect(response).to have_http_status(:unauthorized)
        end
      end
    end
  end
end
