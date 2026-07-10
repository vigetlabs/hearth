require 'rails_helper'

RSpec.describe Schedule, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  describe "active_days" do
    it "returns enabled days" do
      schedule = build(
        :schedule,
        tuesday: false,
        wednesday: false,
        thursday: false,
        saturday: false,
        sunday: false,
      )
      expect(schedule.active_days)
        .to include("monday", "friday")
      expect(schedule.active_days)
        .not_to include(
          "tuesday",
          "wednesday",
          "thursday",
          "saturday",
          "sunday"
        )
    end
  end

  describe "#default_schedule" do
    it "returns the schedule marked as default" do
      user = create(:user)

      create(
        :schedule,
        user: user,
        is_default: false
      )

      default_schedule = create(
        :schedule,
        user: user,
        is_default: true
      )
      expect(user.default_schedule)
        .to eq(default_schedule)
    end
  end
end
