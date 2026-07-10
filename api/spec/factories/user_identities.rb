FactoryBot.define do
  factory :user_identity do
    association :user
    provider { "google_oauth2" }
    provider_uid { SecureRandom.uuid }
    email { user&.email }
    name { [ user&.first_name, user&.last_name ].compact.join(" ") }
  end
end
