class Api::V1::Users::GoogleOauthController < ApplicationController
  def redirect
    redirect_to "/api/v1/users/auth/google_oauth2", allow_other_host: true
  end

  def failure
    redirect_to "#{ENV.fetch("FRONTEND_URL")}/users/login?error=sso_failed",
      allow_other_host: true
  end
end
