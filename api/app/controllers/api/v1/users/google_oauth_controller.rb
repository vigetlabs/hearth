class Api::V1::Users::GoogleOauthController < ApplicationController
  include FrontendPathHelper

  def redirect
    redirect_to "/api/v1/users/auth/google_oauth2", allow_other_host: true
  end

  def failure
    redirect_to frontend_path("/users/login?error=sso_failed"),
      allow_other_host: true
  end
end
