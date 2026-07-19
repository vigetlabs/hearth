FactoryBot.define do
  factory :attendance_confirmation do
    association :user
    association :office

    period_type { :week }
    starts_on { Date.new(2026, 7, 13) }
    ends_on { Date.new(2026, 7, 17) }
  end
end
