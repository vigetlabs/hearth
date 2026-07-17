FactoryBot.define do
  factory :office_presence do
    association :user
    association :office
    connection_id { SecureRandom.uuid }
    last_seen_at { Time.current }
  end
end
