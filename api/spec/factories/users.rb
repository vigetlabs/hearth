FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    first_name { "Brian" }
    last_name { "Williams" }
    password { "password" }
    password_confirmation { password }
  end
end
