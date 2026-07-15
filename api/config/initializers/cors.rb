# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

# Comma-separated list of allowed origins, e.g.
# "https://hearth.vigetx.com,https://staging.hearth.vigetx.com".
# Defaults to the local Vite dev server.
allowed_origins = ENV.fetch("CORS_ORIGINS", "http://localhost:5173").split(",").map(&:strip)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)

    resource "*",
      headers: :any,
      credentials: true,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ]
  end
end
