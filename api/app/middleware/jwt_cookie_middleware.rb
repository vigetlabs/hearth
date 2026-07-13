class JwtCookieMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)
    token = request.cookies["jwt_token"]

    if token.present? && env["HTTP_AUTHORIZATION"].blank?
      env["HTTP_AUTHORIZATION"] = "Bearer #{token}"
    end

    begin
      status, headers, response = @app.call(env)
    rescue JWT::DecodeError
      return invalid_token_response
    end

    # @TODO Refactor in separate helpers for code clarity
    auth_header = headers["Authorization"]
    if auth_header.present? && auth_header.start_with?("Bearer ")
      token = auth_header.split(" ").last

      cookie_options = {
        value: token,
        httponly: true,
        secure: Rails.env.production?,
        same_site: :lax,
        path: "/",
        expires: 2.weeks.from_now
      }

      Rack::Utils.set_cookie_header!(headers, "jwt_token", cookie_options)
      headers.delete("Authorization")
    end

    if request.delete? && request.path.match?(%r{^/logout$})
      Rack::Utils.delete_cookie_header!(headers, "jwt_token", path: "/")
    end

    [ status, headers, response ]
  end

  private

  def build_rack_response(body:, status:, headers: {})
    [
      Rack::Utils::SYMBOL_TO_STATUS_CODE[status],
      headers,
      [ body.to_json ]
    ]
  end

  def invalid_token_response
    headers = { "Content-Type" => "application/json" }
    Rack::Utils.delete_cookie_header!(headers, "jwt_token", path: "/")
    body = ApiErrorResponse.authentication(
      code: ApiErrorCodes::Authentication::AUTHENTICATION_REQUIRED,
      message: "You need to sign in before continuing"
    )

    build_rack_response(
      body: body,
      status: :unauthorized,
      headers: headers
    )
  end
end
