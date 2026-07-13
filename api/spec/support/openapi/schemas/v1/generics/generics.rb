module OpenApi::Schemas::V1::Generics
  # EMPTY_SUCCESS_RESPONSE: Full response body for indicating a successful API request
  #
  # Use this when an endpoint succeeds but does not return a resource payload. This represents
  # the app's custom ApiResponse success shape with data set to null
  EMPTY_SUCCESS_RESPONSE = {
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
end
