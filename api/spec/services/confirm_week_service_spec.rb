require "rails_helper"

RSpec.describe ConfirmWeekService do
  subject(:confirm_week) do
    described_class.new(
      user:,
      office:,
      week_start:,
      selected_dates:
    ).call
  end

  let(:user) { create(:user) }
  let(:office) { create(:office) }
  let(:week_start) { Date.new(2026, 7, 13) }

  describe "#call" do
    context "when valid attendance dates are selected" do
      let(:selected_dates) do
        [
          Date.new(2026, 7, 13),
          Date.new(2026, 7, 15)
        ]
      end

      it "creates visits for the selected dates" do
        expect { confirm_week }
          .to change(Visit, :count)
          .by(2)

        visits =
          Visit
            .where(
              user:,
              office:
            )
            .order(:visit_date)

        expect(visits.map(&:visit_date))
          .to eq(selected_dates)
      end

      it "creates a weekly attendance confirmation" do
        expect { confirm_week }
          .to change(AttendanceConfirmation, :count)
          .by(1)

        confirmation = AttendanceConfirmation.last

        expect(confirmation.user).to eq(user)
        expect(confirmation.office).to eq(office)
        expect(confirmation).to be_week

        expect(confirmation.starts_on)
          .to eq(Date.new(2026, 7, 13))

        expect(confirmation.ends_on)
          .to eq(Date.new(2026, 7, 17))
      end

      it "returns the confirmation and resulting visits" do
        result = confirm_week

        expect(result)
          .to be_a(described_class::ConfirmResult)

        expect(result.confirmation)
          .to be_an(AttendanceConfirmation)

        expect(result.visits.map(&:visit_date))
          .to eq(selected_dates)
      end

      context "when selected dates contain duplicates and are unordered" do
        let(:selected_dates) do
          [
            Date.new(2026, 7, 15),
            Date.new(2026, 7, 13),
            Date.new(2026, 7, 15)
          ]
        end

        it "creates one visit per unique date in chronological order" do
          result = confirm_week

          expect(result.visits.map(&:visit_date))
            .to eq(
              [
                Date.new(2026, 7, 13),
                Date.new(2026, 7, 15)
              ]
            )

          expect(Visit.count).to eq(2)
        end
      end
    end

    context "when the provided week start is not a Monday" do
      let(:week_start) { Date.new(2026, 7, 15) }

      let(:selected_dates) do
        [ Date.new(2026, 7, 15) ]
      end

      it "normalizes the confirmation period to Monday through Friday" do
        result = confirm_week

        expect(result.confirmation.starts_on)
          .to eq(Date.new(2026, 7, 13))

        expect(result.confirmation.ends_on)
          .to eq(Date.new(2026, 7, 17))
      end
    end

    context "when no dates are selected" do
      let(:selected_dates) { [] }

      it "creates a confirmation without creating visits" do
        result = nil

        expect do
          result = confirm_week
        end
          .to change(AttendanceConfirmation, :count)
          .by(1)

        expect(Visit.count).to eq(0)
        expect(result.visits).to be_empty
      end

      context "when visits already exist for the office and week" do
        before do
          create(
            :visit,
            user:,
            office:,
            visit_date: Date.new(2026, 7, 13)
          )

          create(
            :visit,
            user:,
            office:,
            visit_date: Date.new(2026, 7, 15)
          )
        end

        it "removes all existing visits for that office and week" do
          expect { confirm_week }
            .to change(Visit, :count)
            .from(2)
            .to(0)
        end
      end
    end

    context "when obsolete visits exist in the same office and week" do
      let(:selected_dates) do
        [ Date.new(2026, 7, 13) ]
      end

      let!(:selected_visit) do
        create(
          :visit,
          user:,
          office:,
          visit_date: Date.new(2026, 7, 13)
        )
      end

      let!(:obsolete_visit) do
        create(
          :visit,
          user:,
          office:,
          visit_date: Date.new(2026, 7, 15)
        )
      end

      it "keeps selected visits and removes unselected visits" do
        confirm_week

        expect(selected_visit.reload).to be_present

        expect do
          obsolete_visit.reload
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context "when a selected date falls outside the normalized week" do
      let(:selected_dates) do
        [ Date.new(2026, 7, 20) ]
      end

      it "raises an invalid-date error" do
        expect { confirm_week }
          .to raise_error(
            described_class::InvalidDateError,
            "Selected dates must fall within the confirmed week"
          )
      end

      it "does not persist confirmations or visits" do
        expect do
          begin
            confirm_week
          rescue described_class::InvalidDateError
            nil
          end
        end.not_to change(AttendanceConfirmation, :count)

        expect(Visit.count).to eq(0)
      end
    end

    context "when another office has a visit on a selected date" do
      let(:other_office) { create(:office) }

      let(:selected_dates) do
        [ Date.new(2026, 7, 13) ]
      end

      let!(:existing_visit) do
        create(
          :visit,
          user:,
          office: other_office,
          visit_date: Date.new(2026, 7, 13)
        )
      end

      it "raises a conflicting-visit error" do
        expect { confirm_week }
          .to raise_error(
            described_class::ConflictingVisitError,
            "A selected date already has a visit in another office"
          )
      end

      it "does not move or modify the existing visit" do
        expect do
          confirm_week
        rescue described_class::ConflictingVisitError
          nil
        end.not_to change {
          existing_visit.reload.office_id
        }

        expect(existing_visit.office).to eq(other_office)
      end

      it "does not create an attendance confirmation" do
        expect do
          confirm_week
        rescue described_class::ConflictingVisitError
          nil
        end.not_to change(AttendanceConfirmation, :count)
      end
    end

    context "when the week has already been confirmed" do
      let(:selected_dates) do
        [ Date.new(2026, 7, 15) ]
      end

      let!(:existing_confirmation) do
        create(
          :attendance_confirmation,
          user:,
          office:,
          period_type: :week,
          starts_on: week_start
        )
      end

      let!(:existing_visit) do
        create(
          :visit,
          user:,
          office:,
          visit_date: Date.new(2026, 7, 13)
        )
      end

      it "updates the visits to match the newly selected dates" do
        result = confirm_week

        expect(result.visits.map(&:visit_date))
          .to eq([ Date.new(2026, 7, 15) ])

        expect do
          existing_visit.reload
        end.to raise_error(ActiveRecord::RecordNotFound)
      end

      it "reuses the existing attendance confirmation" do
        result = nil

        expect { result = confirm_week }
          .not_to change(AttendanceConfirmation, :count)

        expect(result.confirmation.id)
          .to eq(existing_confirmation.id)
      end
    end

    context "when confirmation creation fails" do
      let(:selected_dates) do
        [ Date.new(2026, 7, 13) ]
      end

      before do
        confirmation = AttendanceConfirmation.new

        allow(AttendanceConfirmation)
          .to receive(:find_or_initialize_by)
          .and_return(confirmation)

        allow(confirmation)
          .to receive(:update!)
          .and_raise(
            ActiveRecord::RecordInvalid.new(
              confirmation
            )
          )
      end

      it "raises the record-invalid error" do
        expect { confirm_week }
          .to raise_error(ActiveRecord::RecordInvalid)
      end

      it "rolls back created visits" do
        expect do
          confirm_week
        rescue ActiveRecord::RecordInvalid
          nil
        end.not_to change(Visit, :count)
      end
    end
  end
end
