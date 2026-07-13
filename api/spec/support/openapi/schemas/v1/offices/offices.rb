module OpenApi::Schemas::V1::Offices
  # OFFICE_OBJECT: Public office object returned by the API
  #
  # This is not a full response body. It only describes the public facing office resource itself
  OFFICE_OBJECT = {
    type: :object,
    description: "Public office data returned by the API.",
    required: %w[
      id
      name
      timezone
      state
      city
    ],
    properties: {
      id: { type: :integer },
      name: { type: :string },
      timezone: {
        type: :string,
        example: "America/Denver"
      },
      state: {
        type: :string,
        example: "Colorado"
      },
      city: {
        type: :string,
        example: "Boulder"
      }
    }
  }

  # @NOTE OFFICE_REQUEST is currently omitted because the main Viget offices will just
  # be included as seed data as opposed to manual creation of this via create endpoint

  # OFFICE_RESPONSE: Full response body for returning an office
  #
  # Use this when an endpoint returns a single schedule wrapped in the standard
  # API response structure. Examples include reading an office's data.
  OFFICE_RESPONSE = {
    type: :object,
    description: "Full response body for endpoints that return a single office.",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        type: :object,
        required: %(office),
        properties: {
          office: OpenApi::Schemas::V1::Offices::OFFICE_OBJECT
        }
      }
    }
  }

  # OFFICES_RESPONSE: Full response body for returning multiple offices
  #
  # Use this when an endpoint returns multiple schedule objects wrapped in the standard API
  # response structure. Examples include the index function
  OFFICES_RESPONSE = {
    type: :object,
    description: "Full response body for endpoints that return a single office.",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        type: :object,
        required: %w[offices],
        properties: {
          offices: {
            type: :array,
            offices: OpenApi::Schemas::V1::Offices::OFFICE_OBJECT
          }
        }
      }
    }
  }
end
