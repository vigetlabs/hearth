require 'rails_helper'

RSpec.describe "Api::V1::Users::Sessions", type: :request do
  let!(:user) { create(:user) }
  describe "POST /users/login" do
    it "logs in and does not store JWT token in authorization header" do
      post api_path("/users/login"), params: {
        user: {
          email: user.email,
          password: "password"
        }
      },
      as: :json

      expect(response).to have_http_status(:ok)
      expect(response.headers["Authorization"]).not_to be_present
      expect(response.headers["Authorization"]).not_to start_with("Bearer ")
    end

    it "logs in and stores the JWT token in the cookie" do
      post api_path("/users/login"), params: {
        user: {
          email: user.email,
          password: "password"
        }
      },
      as: :json

      expect(response).to have_http_status(:ok)
      expect(response.cookies["jwt_token"]).to be_present
    end

    it "returns unauthorized for invalid credentials" do
      post api_path("/users/login"), params: {
        user: {
          email: user.email,
          password: "somepassword"
        }
      },
      as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /users/logout" do
    it "logs out and revokes the JWT using JTIMatcher strategy" do
      post api_path("/users/login"), params: {
        user: {
          email: user.email,
          password: "password"
        }
      },
      as: :json

      token = response.cookies["jwt_token"]
      original_jti = user.reload.jti

      delete api_path("/users/logout"), headers: {
        "Cookie": "jwt_token=#{token}"
      }

      expect(response).to have_http_status(:ok)
      expect(user.reload.jti).not_to eq(original_jti)

      get api_path("/users/me"), headers: {
        "Cookie": "jwt_token=#{token}"
      }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
