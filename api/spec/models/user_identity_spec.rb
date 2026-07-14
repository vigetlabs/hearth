require "rails_helper"

RSpec.describe UserIdentity, type: :model do
  describe "associations" do
    it "belongs to a user" do
      user_identity = build(:user_identity)

      expect(user_identity.user).to be_present
    end
  end

  describe "validations" do
    context "when all required attributes are present" do
      it "is valid" do
        user_identity = build(:user_identity)

        expect(user_identity).to be_valid
      end
    end

    context "when provider is missing" do
      it "is invalid" do
        user_identity = build(:user_identity, provider: nil)

        expect(user_identity).not_to be_valid
        expect(user_identity.errors[:provider]).to include("can't be blank")
      end
    end

    context "when provider_uid is missing" do
      it "is invalid" do
        user_identity = build(:user_identity, provider_uid: nil)

        expect(user_identity).not_to be_valid
        expect(user_identity.errors[:provider_uid]).to include("can't be blank")
      end
    end

    context "when user is missing" do
      it "is invalid" do
        user_identity = build(:user_identity, user: nil)

        expect(user_identity).not_to be_valid
        expect(user_identity.errors[:user]).to include("must exist")
      end
    end

    context "when provider_uid already exists for the same provider" do
      it "is invalid" do
        create(
          :user_identity,
          provider: "google_oauth2",
          provider_uid: "12345"
        )

        duplicate_identity = build(
          :user_identity,
          provider: "google_oauth2",
          provider_uid: "12345"
        )

        expect(duplicate_identity).not_to be_valid
        expect(duplicate_identity.errors[:provider_uid]).to include("has already been taken")
      end
    end

    context "when provider_uid already exists for a different provider" do
      it "is valid" do
        create(
          :user_identity,
          provider: "google_oauth2",
          provider_uid: "12345"
        )

        different_provider_identity = build(
          :user_identity,
          provider: "microsoft",
          provider_uid: "12345"
        )

        expect(different_provider_identity).to be_valid
      end
    end
  end
end
