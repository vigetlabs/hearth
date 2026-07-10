require "swagger_helper"

RSpec.describe "Api::V1::Users::OmniauthCallbacks", type: :request do
  path "/api/v1/users/auth/google_oauth2/callback" do
    get "Handles the Google OAuth callback" do
      tags "Users"
      produces "text/html"

      response "302", "sets the JWT cookie and redirects to the frontend profile" do
        run_test! do |response|
          expect(response).to redirect_to(
            "#{Rails.application.credentials.dig(:google, :frontend_url)}/users/profile"
          )

          expect(response.cookies["jwt_token"]).to be_present
        end
      end
    end
  end
end
