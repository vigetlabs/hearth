require "rails_helper"

RSpec.describe GoogleSsoService do
  describe ".call" do
    let(:mock_auth_hash) do
      OmniAuth::AuthHash.new(
        provider: provider,
        uid: provider_uid,
        info: {
          email: email,
          first_name: first_name,
          last_name: last_name,
          name: name
        },
        extra: {
          raw_info: {
            email_verified: email_verified
          }
        }
      )
    end

    subject(:call_service) { described_class.call(mock_auth_hash) }

    let(:provider) { "google_oauth2" }
    let(:provider_uid) { SecureRandom.uuid.to_s }
    let(:email) { "ryan.dioneda@viget.com" }
    let(:first_name) { "Ryan" }
    let(:last_name) { "Dioneda" }
    let(:name) { "#{first_name} #{last_name}" }
    let(:email_verified) { true }

    context "when a matching user identity already exists" do
      let!(:user) { create(:user, email: email) }
      let!(:identity) do
        create(
          :user_identity,
          user: user,
          provider: provider,
          provider_uid: provider_uid,
          email: email
        )
      end

      it "returns the identity's user" do
        expect(call_service).to eq(user)
      end

      it "does not create another user" do
        expect { call_service }.not_to change(User, :count)
      end
    end

    context "when a user exists with same verified email but no identity" do
      let!(:existing_user) { create(:user, email: email) }

      it "returns the existing user" do
        expect(call_service).to eq(existing_user)
      end

      it "does create another user" do
        expect { call_service }.not_to change(User, :count)
      end

      it "creates a user identity for the existing user" do
        expect { call_service }.to change(UserIdentity, :count).by(1)
        identity = UserIdentity.last
        expect(identity.user).to eq(existing_user)
        expect(identity.provider).to eq(provider)
        expect(identity.provider_uid).to eq(provider_uid)
        expect(identity.email).to eq(email)
      end
    end

    context "when no user exists with the Google email" do
      it "creates a new user" do
        expect { call_service }.to change(User, :count).by(1)
      end

      it "creates the user with the Google profile information" do
        user = call_service
        expect(user.email).to eq(email)
        expect(user.first_name).to eq(first_name)
        expect(user.last_name).to eq(last_name)
      end

      it "creates the user with a password so Devise password auth still works" do
        user = call_service
        expect(user.encrypted_password).to be_present
      end

      it "creates a user identity connected to the new user" do
        expect { call_service }.to change(UserIdentity, :count).by(1)
        user = User.find_by(email: email)
        identity = UserIdentity.last

        expect(identity.user).to eq(user)
        expect(identity.provider).to eq(provider)
        expect(identity.provider_uid).to eq(provider_uid)
        expect(identity.email).to eq(email)
      end

      it "returns the created user instead of identity" do
        result = call_service
        expect(result).to be_a(User)
      end
    end

    context "when the Google auth hash is missing name information" do
      let(:first_name) { nil }
      let(:last_name) { nil }
      let(:name) { nil }

      it "falls back to `Unknown User`" do
        user = call_service
        expect(user.first_name).to eq("Unknown")
        expect(user.last_name).to eq("User")
      end
    end
  end
end
