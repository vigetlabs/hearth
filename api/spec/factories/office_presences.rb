FactoryBot.define do
  factory :office_presence do
    association :user
    association :office
    connection_id { SecureRandom.uuid }
  end
end
