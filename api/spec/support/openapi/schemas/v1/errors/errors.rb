module OpenApi::Schemas::V1::Errors
  # ERROR_RESPONSE: Full response body for a generic API error
  #
  # Use this when the API needs to communicate that the request failed, but does not need to provide field-level
  # validation details. Examples include unauthorized requests, missing records, forbidden actions, or generic server-side
  # failures
  ERROR_RESPONSE = {
    type: :object,
    description: "Full response body for a generic API error without field-level details.",
    required: %w[status],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT
    }
  }

  # ERROR_OBJECT: One individual error detail, not a full API response
  #
  # Use this as an item inside an `errors` array when the API needs to describe exactly waht failed. This is commonly used for
  # validation errors where the frontend needs to know which field failed and what message to show. On its own,
  # ERROR_OBJECT is not a complete response body
  ERROR_OBJECT = {
    type: :object,
    description: "One individual error detail, usually used inside an errors array.",
    required: %w[field message],
    properties: {
      field: { type: :string },
      message: { type: :string }
    }
  }

  # VALIDATION_ERROR_RESPONSE: Full response body for validation errors
  #
  # Use this when submitted data fails validation. Examples include a failed user registation, failed profile update,
  # or any request where the server needs to return both a general failure message and specific field-level errors
  VALIDATION_ERROR_RESPONSE = {
    type: :object,
    description: "Full response body for validation errors with field-level details.",
    required: %w[status errors],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      errors: {
        type: :array,
        items: ERROR_OBJECT
      }
    }
  }
end
