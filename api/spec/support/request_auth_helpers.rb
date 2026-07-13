module RequestAuthHelpers
  def auth_token_for(user)
    post api_path("/users/login"),
      params: {
        user: {
          email: user.email,
          password: user.password
        }
      },
      as: :json
      response.cookies["jwt_token"]
  end

  def auth_headers_for(user)
    {
      "Cookie" => "jwt_token=#{auth_token_for(user)}"
    }
  end
end
