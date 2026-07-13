FactoryBot.define do
  factory :office do
    sequence(:name) { |n| "office#{n}" }
    timezone { "America/Denver" }
    state { "Colorado" }
    city { "Boulder" }
    emoji { "🏛️" }
  end
end
