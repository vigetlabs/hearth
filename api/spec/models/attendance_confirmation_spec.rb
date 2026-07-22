require 'rails_helper'

RSpec.describe AttendanceConfirmation, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:office) }
  end

  describe "validations" do
    subject(:confirmation) do
      build(:attendance_confirmation)
    end

    it do
      expect(confirmation)
        .to validate_presence_of(:period_type)
    end

    it do
      expect(confirmation)
        .to validate_presence_of(:starts_on)
    end
  end

  describe "period normalization" do
    it "normalizes a weekly date to Monday through Friday" do
      confirmation = build(
        :attendance_confirmation,
        starts_on: Date.new(2026, 7, 15),
        ends_on: Date.new(2026, 7, 15)
      )
      confirmation.validate

      expect(confirmation.starts_on)
        .to eq(Date.new(2026, 7, 13))

      expect(confirmation.ends_on)
        .to eq(Date.new(2026, 7, 17))
    end
  end

  describe "#covers?" do
    subject(:confirmation) do
      build(
        :attendance_confirmation,
        starts_on: Date.new(2026, 7, 13),
        ends_on: Date.new(2026, 7, 17)
      )
    end

    before do
      confirmation.validate
    end

    it "returns true for a date inside the period" do
      expect(
        confirmation.covers?(
          Date.new(2026, 7, 15)
        )
      ).to be(true)
    end

    it "returns false for a date outside the period" do
      expect(
        confirmation.covers?(
          Date.new(2026, 7, 20)
        )
      ).to be(false)
    end
  end

  describe "duplicate confirmations" do
    it "does not allow 2 confirmations for the same user, office, and week" do
      existing = create(
        :attendance_confirmation,
        starts_on: Date.new(2026, 7, 13)
      )

      duplicate = build(
        :attendance_confirmation,
        user: existing.user,
        office: existing.office,
        period_type: :week,
        starts_on: Date.new(2026, 7, 15)
      )

      expect(duplicate).not_to be_valid

      expect(duplicate.errors[:user_id])
        .to be_present
    end

    it "allows the same user to confirm different offices for the same week" do
      user = create(:user)
      first_office = create(:office)
      second_office = create(:office)

      create(
        :attendance_confirmation,
        user: user,
        office: first_office,
        starts_on: Date.new(2026, 7, 13)
      )

      confirmation = build(
        :attendance_confirmation,
        user: user,
        office: second_office,
        starts_on: Date.new(2026, 7, 13)
      )

      expect(confirmation).to be_valid
    end

    it "allows the same user to confirm different weeks" do
      existing = create(
        :attendance_confirmation,
        starts_on: Date.new(2026, 7, 13)
      )

      next_week = build(
        :attendance_confirmation,
        user: existing.user,
        office: existing.office,
        starts_on: Date.new(2026, 7, 20)
      )

      expect(next_week).to be_valid
    end
  end
end
