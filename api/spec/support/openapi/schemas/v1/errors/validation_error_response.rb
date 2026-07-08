module OpenApi::Schemas::V1::Errors
  VALIDATION_ERROR_RESPONSE = {
    type: :object,
    required: %w[status errors],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT
    }
  }
end
