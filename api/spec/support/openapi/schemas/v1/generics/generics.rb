module OpenApi::Schemas::V1::Generics
  # GENERIC_SUCCESS_RESPONSE: Full response body for indicating a successful API request
  #
  # Use this when an endpoint succeeds but does not return a resource payload. This represents
  # the app's custom ApiResponse success shape with data set to null
  GENERIC_SUCCESS_RESPONSE = {
    type: :object,
    description: "Generic success response body",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        nullable: true,
        description: "No resource payload is returned for this response",
        example: nil
      }
    }
  }

  # GENERIC_ERROR_RESPONSE: Full response body for indicating a failed request
  #
  # Use this when an endpoint fails using the app's custom ApiResponse error shape. This
  # response includes shared status metadata and optional error details
  GENERIC_ERROR_RESPONSE = {
    type: :object,
    description: "Generic error response body",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      errors: {
        type: :array,
        items: OpenApi::Schemas::V1::Errors::ERROR_OBJECT
      }
    }
  }
end
