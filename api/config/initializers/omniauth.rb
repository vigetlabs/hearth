OmniAuth.config.allowed_request_methods = [ :post, :get ]

if Rails.env.development?
  OmniAuth.config.full_host = Rails.configuration.x.api_url
end
