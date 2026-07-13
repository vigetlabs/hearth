FactoryBot.define do
  factory :visit do
    sequence(:visit_date) { |n| Date.new(2026, 7, 1) + (n - 1).days }
    association :office
    association :user
  end
end
