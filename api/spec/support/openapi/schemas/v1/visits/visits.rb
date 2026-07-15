module OpenApi::Schemas::V1::Visits
  VISIT_DATE = {
    type: :string,
    format: :date,
    description: "Calendar date only with no timezone (YYYY-MM-DD)",
    example: "2026-07-10"
  }

  VISITS_USER_SUMMARY = {
    type: :object,
    required: %w[
      id
      first_name
      last_name
    ],
    properties: {
      id: { type: :integer },
      first_name: { type: :string },
      last_name: { type: :string }
    }
  }


  # VISIT_OBJECT: Public visit object returned by the API
  #
  # This is not a full response body. It only describes the visit resource itself.
  VISIT_OBJECT = {
    type: :object,
    description: "Public visit data returned by the API.",
    required: %w[
      id
      user
      visit_date
      created_at
      updated_at
    ],
    properties: {
      id: { type: :integer },
      user: VISITS_USER_SUMMARY,
      visit_date: VISIT_DATE,
      created_at: {
        type: :string,
        format: :"date-time",
        description: "Created-at time in ISO 8601 format",
        example: "2026-07-10T13:42:18.123Z"
      },
      updated_at: {
        type: :string,
        format: :"date-time",
        description: "Updated-at time in ISO 8601 format",
        example: "2026-07-10T13:42:18.123Z"
      }
    }
  }

  # CREATE_VISITS_REQUEST: Request body for creating a visit
  #
  # Use this as the request body schema for `POST /api/v1/visits`.
  #
  # @NOTE No user information is required in the request payload. The user is associated in the backend level by referring to Devise's
  # `current_user` when creating the visit object.
  CREATE_VISITS_REQUEST = {
    type: :object,
    description: "Request body for creating a new visit",
    required: %w[visits],
    properties: {
      visits: {
        type: :array,
        minItems: 1,
        items: {
          type: :object,
          required: %w[
            visit_date
            office_id
          ],
          properties: {
            visit_date: VISIT_DATE,
            office_id: { type: :integer }
          }
        }
      }
    }
  }

  # VISIT_RESPONSE: Full response body for returning a visit
  #
  # Use this when an endpoint returns a single visit wrapped in the standard API response
  # structure. Examples include reading a visit.
  VISIT_RESPONSE = {
    type: :object,
    description: "Full response body for endpoints that return a single visit.",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        type: :object,
        required: %w[visit],
        properties: {
          visit: OpenApi::Schemas::V1::Visits::VISIT_OBJECT
        }
      }
    }
  }

  # VISITS_RESPONSE: Full response body for returning multiple visits
  #
  # Use this when an endpoint returns multiple visits wrapped in the standard API response
  # structure. Examples include index function.
  VISITS_RESPONSE = {
    type: :object,
    description: "Full response body for endpoints that return a single visit.",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        type: :object,
        required: %w[visits],
        properties: {
          visits: {
            type: :array,
            items: OpenApi::Schemas::V1::Visits::VISIT_OBJECT
          }
        }
      }
    }
  }
end
