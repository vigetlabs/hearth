require "swagger_helper"

RSpec.describe "Api::V1::Users::GoogleOauth", type: :request do
  path "/api/v1/users/auth/google" do
    get "Starts the Google SSO" do
      tags "Users"
      produces "text/html"

      response "302", "redirects to the Google OAuth authorization flow" do
        run_test! do |response|
          expect(response).to have_http_status(:redirect)
          expect(response.location).to include(
            "/api/v1/users/auth/google_oauth2"
          )
        end
      end
    end
  end

  path "/api/v1/users/auth/failure" do
    get "Handles failed Google SSO attempt" do
      tags "Users"
      produces "text/html"

      response "302", "redirects to the frontend with an error path in URL" do
        run_test! do |response|
          expect(response).to redirect_to(
            "#{Rails.application.credentials.dig(:google, :frontend_url)}/users/login?error=sso_failed"
          )
        end
      end
    end
  end
end
