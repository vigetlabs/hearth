class Api::V1::Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include Helpers::FrontendPathHelper

  def google_oauth2
    authenticate_with(GoogleSsoService)
  end

  def slack
    authenticate_with(SlackSsoService)
  end

  def failure
    redirect_to frontend_path("/users/login?error=sso_failed"),
      allow_other_host: true
  end

  private

  def authenticate_with(service)
    auth = request.env["omniauth.auth"]
    user = service.call(auth)

    sign_in(user)

    redirect_to frontend_path(redirect_path_for(user)),
      allow_other_host: true
  rescue StandardError => ewrror
    redirect_to frontend_path("/users/login?error=sso_failed"),
      allow_other_host: true
  end

  def redirect_path_for(user)
    if user.default_schedule.present? && user.office.present?
      "/calendar"
    elsif user.office.blank?
      "/users/office"
    else
      "/users/schedule"
    end
  end
end
