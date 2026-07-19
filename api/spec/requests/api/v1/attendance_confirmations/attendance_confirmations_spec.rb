require "swagger_helper"

RSpec.describe "Api::V1::AttendanceConfirmations::AttendanceConfirmations", type: :request do
  let(:user) { create(:user) }
  let(:office) { create(:office) }
  let(:starts_on) { "2026-07-13" }

  describe "GET /attendance_confirmations" do
    before do
      sign_in user
    end

    subject(:make_request) do
      get api_path("/attendance_confirmations"),
        params: {
          office_id: office.id,
          starts_on: starts_on
        }
    end

    let!(:first_user) { create(:user, office: office) }
    let!(:second_user) { create(:user, office: office) }

    let!(:second_confirmation) do
      create(
        :attendance_confirmation,
        user: second_user,
        office: office,
        period_type: :week,
        starts_on: Date.new(2026, 7, 13)
      )
    end

    let!(:first_confirmation) do
      create(
        :attendance_confirmation,
        user: first_user,
        office: office,
        period_type: :week,
        starts_on: Date.new(2026, 7, 13)
      )
    end

    before do
      first_user.update_column(:id, 101)
      second_user.update_column(:id, 202)
    end

    it "returns confirmations for the requested office and week" do
      make_request

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(json.dig("data", "confirmations").length).to eq(2)
      expect(get_error_message(json)).to eq(
        "Fetched attendance confirmations successfully"
      )
    end

    it "normalizes starts_on to the Monday of the requested week" do
      get api_path("/attendance_confirmations"),
        params: {
          office_id: office.id,
          starts_on: "2026-07-16"
        }

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      confirmation_ids =
        json
          .dig("data", "confirmations")
          .map { |confirmation| confirmation["id"] }

      expect(confirmation_ids).to contain_exactly(
        first_confirmation.id,
        second_confirmation.id
      )
    end

    it "does not return confirmations from another office" do
      other_office = create(:office)

      create(
        :attendance_confirmation,
        office: other_office,
        period_type: :week,
        starts_on: Date.new(2026, 7, 13)
      )

      make_request

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      confirmations = json.dig("data", "confirmations")

      expect(confirmations.length).to eq(2)
    end

    it "does not return confirmations from another week" do
      create(
        :attendance_confirmation,
        office: office,
        period_type: :week,
        starts_on: Date.new(2026, 7, 20)
      )

      make_request

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      confirmations = json.dig("data", "confirmations")

      expect(confirmations.length).to eq(2)
    end

    context "when office_id is missing" do
      it "returns a bad request response" do
        get api_path("/attendance_confirmations"),
          params: {
            starts_on: starts_on
          }

        expect(response).to have_http_status(:bad_request)

        json = JSON.parse(response.body)

        expect(get_error_code(json)).to eq(
          ApiErrorCodes::BadRequest::MISSING_PARAMETER
        )
      end
    end

    context "when office_id is not an integer" do
      it "returns a bad request response" do
        get api_path("/attendance_confirmations"),
          params: {
            office_id: "invalid",
            starts_on: starts_on
          }

        expect(response).to have_http_status(:bad_request)

        json = JSON.parse(response.body)

        expect(get_error_message(json)).to eq(
          "office_id must be a valid integer"
        )
      end
    end

    context "when the office does not exist" do
      it "returns a not found response" do
        get api_path("/attendance_confirmations"),
          params: {
            office_id: -1,
            starts_on: starts_on
          }

        expect(response).to have_http_status(:not_found)

        json = JSON.parse(response.body)

        expect(get_error_code(json)).to eq(
          ApiErrorCodes::NotFound::RESOURCE_NOT_FOUND
        )
      end
    end

    context "when starts_on is missing" do
      it "returns a bad request response" do
        get api_path("/attendance_confirmations"),
          params: {
            office_id: office.id
          }

        expect(response).to have_http_status(:bad_request)

        json = JSON.parse(response.body)

        expect(get_error_code(json)).to eq(
          ApiErrorCodes::BadRequest::MISSING_PARAMETER
        )
      end
    end

    context "when starts_on is invalid" do
      it "returns a bad request response" do
        get api_path("/attendance_confirmations"),
          params: {
            office_id: office.id,
            starts_on: "not-a-date"
          }

        expect(response).to have_http_status(:bad_request)

        json = JSON.parse(response.body)

        expect(get_error_message(json)).to eq(
          "starts_on must be a valid date"
        )
      end
    end

    context "when the user is not authenticated" do
      before do
        sign_out user
      end

      it "returns unauthorized" do
        make_request

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /attendance_confirmations" do
    before do
      sign_in user
    end

    subject(:make_request) do
      post api_path("/attendance_confirmations"),
        params: {
          office_id: office.id,
          starts_on: starts_on,
          selected_dates: [
            "2026-07-14",
            "2026-07-16"
          ]
        },
        as: :json
    end

    it "confirms the week and returns the confirmation and visits" do
      make_request

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(
        json.dig("data", "attendance_confirmation")
      ).to be_present

      expect(json.dig("data", "visits").length).to eq(2)

      expect(get_error_message(json)).to eq(
        "Successfully created confirmed visits"
      )
    end

    it "creates an attendance confirmation for the normalized week" do
      expect { make_request }
        .to change(AttendanceConfirmation, :count)
        .by(1)

      confirmation = AttendanceConfirmation.last

      expect(confirmation).to have_attributes(
        user_id: user.id,
        office_id: office.id,
        period_type: "week",
        starts_on: Date.new(2026, 7, 13)
      )
    end

    it "creates confirmed visits for the selected dates" do
      expect { make_request }
        .to change(Visit, :count)
        .by(2)

      visits =
        Visit
          .where(user: user)
          .order(:visit_date)

      expect(visits.map(&:visit_date)).to eq(
        [
          Date.new(2026, 7, 14),
          Date.new(2026, 7, 16)
        ]
      )

      expect(visits).to all(
        have_attributes(
          office_id: office.id
        )
      )
    end

    it "normalizes starts_on to Monday" do
      post api_path("/attendance_confirmations"),
        params: {
          office_id: office.id,
          starts_on: "2026-07-16",
          selected_dates: [ "2026-07-16" ]
        },
        as: :json

      expect(response).to have_http_status(:ok)

      expect(AttendanceConfirmation.last.starts_on).to eq(
        Date.new(2026, 7, 13)
      )
    end

    context "when office_id is missing" do
      it "returns a bad request response" do
        post api_path("/attendance_confirmations"),
          params: {
            starts_on: starts_on,
            selected_dates: [ "2026-07-14" ]
          },
          as: :json

        expect(response).to have_http_status(:bad_request)

        json = JSON.parse(response.body)

        expect(get_error_code(json)).to eq(
          ApiErrorCodes::BadRequest::MISSING_PARAMETER
        )
      end
    end

    context "when office_id is invalid" do
      it "returns a bad request response" do
        post api_path("/attendance_confirmations"),
          params: {
            office_id: "invalid",
            starts_on: starts_on,
            selected_dates: [ "2026-07-14" ]
          },
          as: :json

        expect(response).to have_http_status(:bad_request)

        json = JSON.parse(response.body)

        expect(get_error_message(json)).to eq(
          "office_id must be a valid integer"
        )
      end
    end

    context "when the office does not exist" do
      it "returns a not found response" do
        post api_path("/attendance_confirmations"),
          params: {
            office_id: -1,
            starts_on: starts_on,
            selected_dates: [ "2026-07-14" ]
          },
          as: :json

        expect(response).to have_http_status(:not_found)

        json = JSON.parse(response.body)

        expect(get_error_code(json)).to eq(
          ApiErrorCodes::NotFound::RESOURCE_NOT_FOUND
        )
      end
    end

    context "when starts_on is missing" do
      it "returns a bad request response" do
        post api_path("/attendance_confirmations"),
          params: {
            office_id: office.id,
            selected_dates: [ "2026-07-14" ]
          },
          as: :json

        expect(response).to have_http_status(:bad_request)

        json = JSON.parse(response.body)

        expect(get_error_code(json)).to eq(
          ApiErrorCodes::BadRequest::MISSING_PARAMETER
        )
      end
    end

    context "when starts_on is invalid" do
      it "returns a bad request response" do
        post api_path("/attendance_confirmations"),
          params: {
            office_id: office.id,
            starts_on: "invalid",
            selected_dates: [ "2026-07-14" ]
          },
          as: :json

        expect(response).to have_http_status(:bad_request)

        json = JSON.parse(response.body)

        expect(get_error_message(json)).to eq(
          "starts_on must be a valid date"
        )
      end
    end

    context "when selected_dates is missing" do
      it "returns a bad request response" do
        post api_path("/attendance_confirmations"),
          params: {
            office_id: office.id,
            starts_on: starts_on
          },
          as: :json

        expect(response).to have_http_status(:bad_request)

        json = JSON.parse(response.body)

        expect(get_error_code(json)).to eq(
          ApiErrorCodes::BadRequest::MISSING_PARAMETER
        )
      end
    end

    context "when selected_dates is not an array" do
      it "returns a bad request response" do
        post api_path("/attendance_confirmations"),
          params: {
            office_id: office.id,
            starts_on: starts_on,
            selected_dates: "2026-07-14"
          },
          as: :json

        expect(response).to have_http_status(:bad_request)

        json = JSON.parse(response.body)

        expect(get_error_message(json)).to eq(
          "selected_dates must be an array"
        )
      end
    end

    context "when selected_dates contains an invalid date" do
      it "returns a bad request response" do
        post api_path("/attendance_confirmations"),
          params: {
            office_id: office.id,
            starts_on: starts_on,
            selected_dates: [
              "2026-07-14",
              "invalid"
            ]
          },
          as: :json

        expect(response).to have_http_status(:bad_request)

        json = JSON.parse(response.body)

        expect(get_error_message(json)).to eq(
          "selected_dates must contain valid dates"
        )
      end
    end

    context "when selected_dates is empty" do
      it "creates a confirmation with no visits" do
        post api_path("/attendance_confirmations"),
          params: {
            office_id: office.id,
            starts_on: starts_on,
            selected_dates: []
          },
          as: :json

        expect(response).to have_http_status(:ok)

        json = JSON.parse(response.body)

        expect(json.dig("data", "visits")).to eq([])

        expect(
          AttendanceConfirmation.exists?(
            user: user,
            office: office,
            period_type: :week,
            starts_on: Date.new(2026, 7, 13)
          )
        ).to be(true)
      end
    end

    context "when the user is not authenticated" do
      before do
        sign_out user
      end

      it "returns unauthorized" do
        make_request

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
