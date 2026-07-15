module OpenApi::Schemas::V1::Schedules
  DAYS = %w[
    monday
    tuesday
    wednesday
    thursday
    friday
    saturday
    sunday
  ]

  DAY_PROPERTIES = DAYS.index_with do
    {
      type: :boolean,
      description: "Whether the user has selected this day in their schedule"
    }
  end

  SCHEDULE_ATTRIBUTES = {
    type: :object,
    required: [
      "is_default",
      *DAYS
    ],
    properties: {
      is_default: { type: :boolean },
      **DAY_PROPERTIES
    }
  }

  # CREATE_USER_REQUEST: Request body for creating a schedule
  #
  # Use this as the request body schema for `POST /api/v1/schedules`
  CREATE_SCHEDULE_REQUEST = {
    type: :object,
    description: "Request body for creating a new schedule",
    required: %w[schedule],
    properties: {
      schedule: SCHEDULE_ATTRIBUTES
    }
  }

  # SCHEDULE_OBJECT: Public schedule object returned by the API
  #
  # This is not a full response body. It only describes the public facing schedule resource itself. Sensitive fields like user_id are not included
  # in this schema
  SCHEDULE_OBJECT = {
    type: :object,
    description: "Public schedule data returned by the API.",
    required: [
      "id",
      "is_default",
      *DAYS
    ],
    properties: {
      id: { type: :integer },
      is_default: { type: :boolean },
      **DAY_PROPERTIES
    }
  }

  # SCHEDULE_RESPONSE: Full response body for returning a schedule
  #
  # Use this when an endpoint returns a single schedule wrapped in the standard API response
  # structure. Examples include successful schedule creation.
  SCHEDULE_RESPONSE = {
    type: :object,
    description: "Full response body for endpoints that return a single schedule.",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        type: :object,
        required: %w[schedule],
        properties: {
          schedule: OpenApi::Schemas::V1::Schedules::SCHEDULE_OBJECT
        }
      }
    }
  }

  # SCHEDULES_RESPONSE: Full response body for returning multiple schedules
  #
  # Use this when an endpoint returns multiple schedule objects wrapped in the standard API
  # response structure. Examples include the index function.
  SCHEDULES_RESPONSE = {
    type: :object,
    description: "Full response body for endpoints that return multiple schedules.",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        type: :object,
        required: %w[schedules],
        properties: {
          schedules: {
            type: :array,
            items: OpenApi::Schemas::V1::Schedules::SCHEDULE_OBJECT
          }
        }
      }
    }
  }
end
