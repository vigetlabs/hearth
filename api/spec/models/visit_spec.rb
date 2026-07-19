require "rails_helper"

RSpec.describe Visit, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:office) }
  end

  describe "validations" do
    subject(:visit) { build(:visit) }

    it { is_expected.to validate_presence_of(:visit_date) }

    it do
      expect(visit).to validate_uniqueness_of(:visit_date)
        .scoped_to(:user_id)
    end
  end

  describe "visit date uniqueness" do
    let(:user) { create(:user) }
    let(:office) { create(:office) }
    let(:visit_date) { Date.new(2026, 7, 13) }

    before do
      create(
        :visit,
        user: user,
        office: office,
        visit_date: visit_date
      )
    end

    context "when the same user already has a visit on the date" do
      subject(:duplicate_visit) do
        build(
          :visit,
          user: user,
          office: office,
          visit_date: visit_date
        )
      end

      it "is invalid" do
        expect(duplicate_visit).not_to be_valid
      end

      it "adds an error to visit_date" do
        duplicate_visit.validate
        expect(duplicate_visit.errors[:visit_date]).to include(
          "has already been taken"
        )
      end
    end

    context "when a different user has a visit on the same date" do
      subject(:visit_for_other_user) do
        build(
          :visit,
          user: create(:user),
          office: office,
          visit_date: visit_date
        )
      end

      it "is valid" do
        expect(visit_for_other_user).to be_valid
      end
    end

    context "when the same user has a visit on a different date" do
      subject(:visit_on_different_date) do
        build(
          :visit,
          user: user,
          office: office,
          visit_date: visit_date + 1.day
        )
      end

      it "is valid" do
        expect(visit_on_different_date).to be_valid
      end
    end
  end
end
