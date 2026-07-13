# This custom authentication failure is registered in `config/initializers/devise.rb`
class ApiAuthenticationFailure < Devise::FailureApp
  def respond
    self.status = :unauthorized
    self.content_type = "application/json"

    self.response_body = ApiErrorResponse.authentication(
      code: authentication_error_code,
      message: i18n_message
    ).to_json
  end

  private

  def authentication_error_code
    attempted_login? ? ApiErrorCodes::Authentication::INVALID_CREDENTIALS : ApiErrorCodes::Authentication::AUTHENTICATION_REQUIRED
  end

  def attempted_login?
    request.path.end_with?("/users/login")
  end
end
