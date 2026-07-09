class Api::V1::Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    auth = request.env["omniauth.auth"]
    user = GoogleSsoService.call(auth)

    sign_in(user)

    redirect_to "#{ENV.fetch("FRONTEND_URL")}/users/profile",
      allow_other_host: true
  end

  def failure
    redirect_to "#{ENV.fetch("FRONTEND_URL")}/users/login?error=sso_failed",
      allow_other_host: true
  end
end
