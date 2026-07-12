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
    description: "One individual error, usually used inside an errors array.",
    required: %w[field message],
    properties: {
      field: { type: :string },
      message: { type: :string }
    }
  }

  # ERROR_TYPE: Error metadata used in the ERROR_METADATA_OBJECT to define the type of error
  #
  # This ERROR_TYPE is to allow for discriminant error handling in the frontend by defining the type
  ERROR_TYPE = {
    type: :string,
    description: "Readable custom defined error type.",
    enum: %w[
      authentication_error
      validation_error
      not_found_error
    ]
  }

  # ERROR_CODE: Error metadata used in the ERROR_METADATA_OBJECT to define the code of error
  #
  # This ERROR_CODE is to allow for discriminant error handling in the frontend by defining the code
  ERROR_CODE = {
    type: :string,
    description: "Readable custom defined error code.",
    enum: %w[
      authentication_required
      invalid_credentials
      invalid_attributes
      user_not_found
      office_not_found
      schedule_not_found
      visit_not_found
    ]
  }

  # ERROR_METADATA_OBJECT: Used in a API error response
  #
  # This object is to allow for discriminant error handling in the fonrtned by providing more custom
  # error metadata
  ERROR_METADATA_OBJECT = {
    type: :object,
    description: "One individual error detail signifying the type of error for discriminant error handling.",
    required: %w[type code],
    properties: {
      type: ERROR_TYPE,
      code: ERROR_CODE
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
      error: ERROR_METADATA_OBJECT,
      errors: {
        type: :array,
        items: ERROR_OBJECT
      }
    }
  }
end
