module OpenApi::Schemas::V1::AttendanceConfirmations
  PERIOD_TYPES = %w[week]

  ATTENDANCE_CONFIRMATION_OBJECT = {
    type: :object,
    description: "An attendance confirmation for a specific time period.",
    required: %w[
      id
      user_id
      office_id
      period_type
      starts_on
    ],
    properties: {
      id: {
        type: :integer
      },
      user_id: {
        type: :integer
      },
      office_id: {
        type: :integer
      },
      period_type: {
        type: :string,
        enum: PERIOD_TYPES
      },
      starts_on: {
        type: :string,
        format: :date,
        description: "The normalized start date of the confirmation period."
      },
      created_at: {
        type: :string,
        format: :"date-time"
      },
      updated_at: {
        type: :string,
        format: :"date-time"
      }
    }
  }

  CREATE_ATTENDANCE_CONFIRMATION_REQUEST = {
    type: :object,
    description: "Request body for confirming attendance for a week.",
    required: %w[
      office_id
      starts_on
      selected_dates
    ],
    properties: {
      office_id: {
        type: :integer,
        description: "The office for which attendance is being confirmed."
      },
      starts_on: {
        type: :string,
        format: :date,
        description: <<~DESCRIPTION.squish
          Any date within the week being confirmed. The API normalizes this
          value to the Monday of that week.
        DESCRIPTION
      },
      selected_dates: {
        type: :array,
        description: <<~DESCRIPTION.squish,
          The dates for which visits should exist. An empty array confirms
          the week without creating visits.
        DESCRIPTION
        items: {
          type: :string,
          format: :date
        }
      }
    }
  }

  ATTENDANCE_CONFIRMATIONS_RESPONSE = {
    type: :object,
    description: "Response containing attendance confirmations for an office and week.",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        type: :object,
        required: %w[confirmations],
        properties: {
          confirmations: {
            type: :array,
            items: ATTENDANCE_CONFIRMATION_OBJECT
          }
        }
      }
    }
  }

  CREATE_ATTENDANCE_CONFIRMATION_RESPONSE = {
    type: :object,
    description: "Response returned after confirming attendance for a week.",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        type: :object,
        required: %w[
          attendance_confirmation
          visits
        ],
        properties: {
          attendance_confirmation: ATTENDANCE_CONFIRMATION_OBJECT,
          visits: {
            type: :array,
            items: OpenApi::Schemas::V1::Visits::VISIT_OBJECT
          }
        }
      }
    }
  }
end
