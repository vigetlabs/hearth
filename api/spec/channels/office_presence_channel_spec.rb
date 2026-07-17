require "rails_helper"

RSpec.describe OfficePresenceChannel, type: :channel do
  let(:user) { create(:user) }
  let(:office) { create(:office) }
  let(:connection_id) { SecureRandom.uuid }

  before do
    stub_connection(
      current_user: user,
      connection_id: connection_id
    )
  end

  describe "#subscribed" do
    context "when the user is authenticated" do
      it "successfully subscribes" do
        subscribe(office_id: office.id)

        expect(subscription).to be_confirmed
        expect(subscription).to have_stream_for(office)
      end

      it "creates an office presence record" do
        expect do
          subscribe(office_id: office.id)
        end.to change(OfficePresence, :count).by(1)
        presence = OfficePresence.last
        expect(presence).to have_attributes(
          user_id: user.id,
          office_id: office.id,
          connection_id: connection_id
        )
        expect(presence.last_seen_at).to be_present
      end

      it "does not create a duplicate presence for the same connection" do
        create(
          :office_presence,
          user: user,
          office: office,
          connection_id: connection_id
        )

        expect do
          subscribe(office_id: office.id)
        end.not_to change(OfficePresence, :count)
      end
    end
  end
end
