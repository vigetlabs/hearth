OmniAuth.config.test_mode = true

RSpec.configure do |config|
  config.before do
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: SecureRandom.uuid.to_s,
      info: {
        email: "ryan.dioneda@viget.com",
        first_name: "Ryan",
        last_name: "Dioneda",
        name: "Ryan Dioneda"
      },
      extra: {
        raw_info: {
          email_verified: true
        }
      }
    )
  end

  config.after do
    OmniAuth.config.mock_auth[:google_oauth2] = nil
  end
end
