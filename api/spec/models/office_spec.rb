require 'rails_helper'

RSpec.describe Office, type: :model do
  describe "validations" do
    subject(:office) { build(:office) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:timezone) }
    it { is_expected.to validate_presence_of(:state) }
    it { is_expected.to validate_presence_of(:city) }

    it do
      is_expected.to validate_inclusion_of(:timezone)
        .in_array(
          ActiveSupport::TimeZone.all.map(&:tzinfo).map(&:name)
        )
    end

    describe "name uniqueness" do
      before do
        create(
          :office,
          name: "The Best Office",
          city: "Boulder",
          state: "Colorado"
        )
      end

      it "does not allow the same office name in the same city and state" do
        duplicate = build(
          :office,
          name: "The Best Office",
          city: "Boulder",
          state: "Colorado"
        )

        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:name]).to include("has already been taken")
      end

      it "treats differently cased values as duplicates" do
        duplicate = build(
          :office,
          name: "THE BEST OFFICE",
          city: "BOULDER",
          state: "COLORADO"
        )

        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:name]).to include("has already been taken")
      end

      it "allows the same name in a different city" do
        office = build(
          :office,
          name: "The Best Office",
          city: "Denver",
          state: "Colorado"
        )

        expect(office).to be_valid
      end

      it "allows the same name and city in a different state" do
        office = build(
          :office,
          name: "The Best Office",
          city: "Boulder",
          state: "Utah"
        )

        expect(office).to be_valid
      end
    end

    describe "location normalization" do
      it "normalizes whitespace and casing" do
        office = build(
          :office,
          name: "   Viget      NY Office   ",
          state: " New    York ",
          city: " New     york ",
        )
        office.valid?
        expect(office.name).to eq("viget ny office")
        expect(office.state).to eq("new york")
        expect(office.city).to eq("new york")
      end

      it "allows nil values to be handled by the presence validations" do
        office = build(
          :office,
          name: nil,
          city: nil,
          state: nil
        )
        expect { office.valid? }.not_to raise_error
        expect(office.errors[:name]).to include("can't be blank")
        expect(office.errors[:city]).to include("can't be blank")
        expect(office.errors[:state]).to include("can't be blank")
      end
    end

    describe "timezone validation" do
      it "is valid with an IANA timezone" do
        office = build(:office, timezone: "America/Denver")

        expect(office).to be_valid
      end

      it "is invalid with a timezone abbreviation" do
        office = build(:office, timezone: "MST")

        expect(office).not_to be_valid
        expect(office.errors[:timezone]).to include("is not included in the list")
      end

      it "is invalid with an unknown timezone" do
        office = build(:office, timezone: "Not/A_Timezone")

        expect(office).not_to be_valid
        expect(office.errors[:timezone]).to include("is not included in the list")
      end
    end

    describe "location uniqueness" do
      before do
        create(
          :office,
          name: "viget",
          city: "boulder",
          state: "colorado"
        )
      end

      it "rejects an office with the same normalized location" do
        duplicate = build(
          :office,
          name: "VIGET",
          city: "BOULDER",
          state: "COLORADO"
        )

        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:name]).to include("has already been taken")
      end

      it "allows the same name in a different city" do
        office = build(
          :office,
          name: "Viget",
          city: "Durham",
          state: "North Carolina"
        )

        expect(office).to be_valid
      end

      it "allows the same name and city in a different state" do
        office = build(
          :office,
          name: "Viget",
          city: "Boulder",
          state: "Utah"
        )

        expect(office).to be_valid
      end
    end
  end
end
