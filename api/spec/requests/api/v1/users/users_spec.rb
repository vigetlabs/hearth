require "rails_helper"

RSpec.describe "Api::V1::Users::Users", type: :request do
  describe "GET /users/me" do
    context "when the user is authorized" do
      let(:user) { create(:user, office: office) }

      let(:auth_token) do
        post api_path("/users/login"),
          params: {
            user: {
              email: user.email,
              password: user.password
            }
          },
          as: :json

        response.cookies["jwt_token"]
      end

      let(:headers) do
        {
          "Cookie" => "jwt_token=#{auth_token}"
        }
      end

      context "when the user belongs to an office" do
        let(:office) { create(:office) }

        it "returns the user's information" do
          get api_path("/users/me"), headers: headers

          expect(response).to have_http_status(:ok)
          json = JSON.parse(response.body)
          user_data = json["data"]["user"]

          # @TODO: Add default_schedule and lab once integrated
          expect(user_data).to include(
            "email" => user.email,
            "first_name" => user.first_name,
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
