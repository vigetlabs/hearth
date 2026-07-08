require 'rails_helper'

RSpec.describe "Api::V1::Users::Users", type: :request do
  let!(:user) { create(:user) }

  let(:auth_token) do
    post api_path("/users/login"), params: {
      user: {
        email: user.email,
        password: user.password
      }
    },
    as: :json
    response.cookies["jwt_token"]
  end

  describe "GET /users/me" do
    it "fetches the users information when the user is authorized" do
      get api_path("/users/me"), headers: {
        "Cookie": "jwt_token=#{auth_token}"
      }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      user_data = json["data"]["user"]
      expect(user_data["email"]).to eq(user.email)
      expect(user_data["first_name"]).to eq(user.first_name)
      expect(user_data["last_name"]).to eq(user.last_name)
    end

    it "returns unauthorized on unauthorized request" do
      get api_path("/users/me")
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns unauthorized when the jwt token is invalid" do
      get api_path("/users/me"), headers: {
        "Cookie": "jwt_token=bad-token"
      }
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns unauthorized when jwt_token cookie is missing" do
      get api_path("/users/me"), headers: {
        "Cookie": "some_other_cookie=value"
      }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
