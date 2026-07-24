class Api::V1::Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include Helpers::FrontendPathHelper

  def google_oauth2
    auth = request.env["omniauth.auth"]
    user = GoogleSsoService.call(auth)

    sign_in(user)

    redirect_path =
      if user.default_schedule.present? && user.office.present?
        "/calendar"
      elsif user.office.blank?
        "/users/office"
      else
        "/users/schedule"
      end

    redirect_to frontend_path(redirect_path),
      allow_other_host: true
  end

  def failure
    redirect_to frontend_path("/users/login?error=sso_failed"),
      allow_other_host: true
  end
end
