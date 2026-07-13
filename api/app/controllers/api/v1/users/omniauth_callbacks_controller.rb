class Api::V1::Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include Helpers::FrontendPathHelper

  def google_oauth2
    auth = request.env["omniauth.auth"]
    user = GoogleSsoService.call(auth)

    sign_in(user)

    redirect_to frontend_path("/users/office"),
      allow_other_host: true
  end

  def failure
    redirect_to frontend_path("/users/login?error=sso_failed"),
      allow_other_host: true
  end
end
