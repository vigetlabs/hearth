require 'rails_helper'

RSpec.describe OfficePresence, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:office).optional }
    it { is_expected.to belong_to(:user) }
  end

  let(:user) { create(:user) }
  let(:office) { create(:office) }
  let(:connection_id) { SecureRandom.uuid }

  subject(:office_presence) do
    described_class.new(
      user: user,
      office: office,
      connection_id: connection_id,
      last_seen_at: Time.current
    )
  end

  describe  "validations" do
    context "when all attributes are present" do
      it "is valid" do
        expect(office_presence).to be_valid
      end
    end

    context "when user is missing" do
      it "is invalid" do
        office_presence.user = nil
        expect(office_presence).not_to be_valid
      end
    end

    context "when office is missing" do
      it "is valid" do
        office_presence.office = nil
        expect(office_presence).to be_valid
      end
    end

    context "when connection_id is missing" do
      it "is invalid" do
        office_presence.connection_id = nil
        expect(office_presence).not_to be_valid
      end
    end

    context "when last_seen_at is missing" do
      it "is invalid" do
        office_presence.last_seen_at = nil
        expect(office_presence).not_to be_valid
      end
    end

    context "when connection_id already exists for the same user and office" do
      it "is invalid" do
        office_presence.save!

        duplicate_presence = build(
          :office_presence,
          user: office_presence.user,
          office: office_presence.office,
          connection_id: office_presence.connection_id
        )

        expect(duplicate_presence).not_to be_valid
        expect(duplicate_presence.errors[:connection_id]).to include(
          "has already been taken"
        )
      end
    end

    context "when the connection_id exists for a different office" do
      it "is valid" do
        office_presence.save!

        other_presence = build(
          :office_presence,
          user: office_presence.user,
          connection_id: office_presence.connection_id
        )
        expect(other_presence).to be_valid
      end
    end

    context "when the connection_id exists for a different user" do
      it "is valid" do
        office_presence.save!

        presence = build(
          :office_presence,
          user: create(:user),
          office: office_presence.office,
          connection_id: office_presence.connection_id
        )
        expect(presence).to be_valid
      end
    end
  end

  describe "scopes" do
    include ActiveSupport::Testing::TimeHelpers

    describe ".active" do
      it "returns presences seen within the stale threshold" do
        travel_to(Time.zone.local(2026, 7, 17, 12, 0, 0)) do
          active_presence = create(
            :office_presence,
            last_seen_at: described_class::STALE_AFTER.ago
          )

          recently_seen_presence = create(
            :office_presence,
            last_seen_at: 1.second.ago
          )

          stale_presence = create(
            :office_presence,
            last_seen_at: described_class::STALE_AFTER.ago - 1.second
          )

          expect(described_class.active).to contain_exactly(
            active_presence,
            recently_seen_presence
          )
          expect(described_class.active).not_to include(stale_presence)
        end
      end
    end

    describe ".stale" do
      it "returns presences seen before the stale threshold" do
        travel_to(Time.zone.local(2026, 7, 17, 12, 0, 0)) do
          stale_presence = create(
            :office_presence,
            last_seen_at: described_class::STALE_AFTER.ago - 1.second
          )
          older_stale_presence = create(
            :office_presence,
            last_seen_at: described_class::STALE_AFTER.ago - 1.hour
          )
          active_presence = create(
            :office_presence,
            last_seen_at: described_class::STALE_AFTER.ago
          )
          expect(described_class.stale).to contain_exactly(
            stale_presence,
            older_stale_presence
          )
          expect(described_class.stale).not_to include(active_presence)
        end
      end
    end
  end
end
