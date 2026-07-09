require 'rails_helper'

RSpec.describe "Api::V1::Users::GoogleOauths", type: :request do
  describe "GET /users/auth/google" do
    it "redirects to the Devise Google OAuth authorize endpoint" do
      get api_path("/users/auth/google")

      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to("/api/v1/users/auth/google_oauth2")
    end
  end

  describe "GET /users/auth/failure" do
    it "redirects user to frontend with error url" do
      get api_path("/users/auth/failure")
      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to(
        "#{ENV.fetch("FRONTEND_URL")}/users/login?error=sso_failed"
      )
    end
  end
end
