module OpenApi::Schemas::V1::Errors
  ERROR_RESPONSE = {
    type: :object,
    required: %w[status],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT
    }
  }
end
