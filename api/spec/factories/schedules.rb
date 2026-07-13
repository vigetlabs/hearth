FactoryBot.define do
  factory :schedule do
    association :user

    is_default { true }

    monday { true }
    tuesday { true }
    wednesday { true }
    thursday { true }
    friday { true }
    saturday { true }
    sunday { true }
  end
end
