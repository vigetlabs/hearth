require "rails_helper"

RSpec.describe "Api::V1::Users::Users", type: :request do
  let(:office) { create(:office) }

  let(:user) { create(:user, office: office) }
  let(:headers) { auth_headers_for(user) }

  describe "GET /users" do
    let!(:users) { create_list(:user, 3, office: office) }
    let(:query_params) do
      {
        office_id: office.id
      }
    end

    subject(:get_office_roster) do
      get api_path("/users"),
        params: query_params,
        headers: headers
    end
    context "when the user is authenticated" do
      context "with valid query parmeters" do
        it "returns all of the users associated with the requested office" do
          get_office_roster
          json = JSON.parse(response.body)

          returned_users = json["data"]["users"]
          expect(returned_users.length).to eq(4)
          expect(returned_users.pluck("office")).to all(
            eq(
              {
                "id" => office.id,
                "name" => office.name
              }
            )
          )
        end
      end
    end
  end

  describe "PATCH /users/me" do
    context "when the user is not authorized" do
      it "returns unauthorized when the jwt_token cookie is missing" do
        patch api_path("/users/me"),
          params: {
            user: {
              first_name: "Ryan"
            }
          },
          as: :json
        expect(response).to have_http_status(:unauthorized)
      end

      it "returns unauthorized when the jwt_token is invalid" do
        patch api_path("/users/me"),
          params: {
            user: {
              first_name: "Ryan"
            }
          },
          headers: {
            "Cookie" => "jwt_token=bad-token"
          },
          as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end


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

      context "with invalid parameters" do
        it "returns unprocessable content" do
          patch api_path("/users/me"),
            params: {
              user: {
                office_id: -1
              }
            },
            headers: auth_headers_for(user),
            as: :json
            expect(response).to have_http_status(:unprocessable_content)
            expect(user.office).to eq(office)
        end

        it "returns a validation error" do
          patch api_path("/users/me"),
            params: {
              user: {
                office_id: -1
              }
            },
            headers: auth_headers_for(user),
            as: :json
            json = JSON.parse(response.body)
            expect(json["error"]["details"]).to be_present
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
            "office" => {
              "id" => office.id,
              "name" => office.name
            }
          )
        end
      end

      context "when the user does not belong to an office" do
        let(:office) { nil }

        it "returns a null office" do
          get api_path("/users/me"), headers: headers

          expect(response).to have_http_status(:ok)

          user_data = response.parsed_body.dig("data", "user")

          expect(user_data).to include(
            "email" => user.email,
            "first_name" => user.first_name,
            "last_name" => user.last_name,
            "office" => nil
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
