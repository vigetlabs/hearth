module OpenApi::Schemas::V1::Errors
  # ERROR_RESPONSE: Full response body for a generic error. It is used when the API only needs to say that something
  # failed without giving field-level details. Examples include an unauthorized request, missing record, or generic
  # server-side failure
  ERROR_RESPONSE = {
    type: :object,
    required: %w[status],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT
    }
  }

  # ERROR_OBJECT: One dividual error detail, not a full API response. It describes one item inside an `errors` array,
  # usually for form or validation errors. Examples include when frontend submits data to the frontend and the server
  # needs to tell the frontend exactly which field failed and what message to show. On its own, `ERROR_OBJECT` is
  # incomplete as a response because does not include top-level `status` message
  ERROR_OBJECT = {
    type: :object,
    required: %w[field message],
    properties: {
      field: { type: :string },
      message: { type: :string }
    }
  }

  # VALIDATION_ERROR_RESPONSE: Full response body for validation errors. Examples include when user creation fails,
  # the API would have to return a message and why it failed
  VALIDATION_ERROR_RESPONSE = {
    type: :object,
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
