require 'rails_helper'

RSpec.describe "Api::V1::Users::OmniauthCallbacks", type: :request do
  describe "GET /users/auth/google_oauth2/callback" do
    context "when Google SSO succeeds" do
      def callback_request
        get api_path("/users/auth/google_oauth2/callback")
      end

      it "creates a user and user identity" do
        expect {
          callback_request
        }
          .to change(User, :count).by(1)
          .and change(UserIdentity, :count).by(1)
      end

      it "redirects to the frontend profile page" do
        callback_request
        expect(response).to have_http_status(:redirect)
        expect(response).to redirect_to(
          "#{Rails.application.credentials.dig(:google, :frontend_url)}/users/profile"
        )
      end

      it "does not expose the JWT in the authorization header" do
        callback_request
        expect(response.headers["Authorization"]).not_to be_present
      end

      it "stores the JWT in a cookie" do
        callback_request
        expect(response.cookies["jwt_token"]).to be_present
      end
    end

    context "when Google SSO fails" do
      before do
        OmniAuth.config.mock_auth[:google_oauth2] = :invalid_credentials
      end

      it "redirects to the frontend login page with an error in URL" do
        get api_path("/users/auth/google_oauth2/callback")
        expect(response).to redirect_to(
          "#{Rails.application.credentials.dig(:google, :frontend_url)}/users/login?error=sso_failed"
        )
        expect(response.cookies["jwt_token"]).not_to be_present
      end
    end
  end
end
