# This custom authentication failure is registered in `config/initializers/devise.rb`
class ApiAuthenticationFailure < Devise::FailureApp
  def respond
    self.status = :unauthorized
    self.content_type = "application/json"

    self.response_body = ApiErrorResponse.authentication(
      message: i18n_message
    ).to_json
  end
end
