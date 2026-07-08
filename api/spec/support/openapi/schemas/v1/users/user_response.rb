module OpenApi::Schemas::V1::Users
  USER_RESPONSE = {
    type: :object,
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        type: :object,
        required: %w[user],
        properties: {
          user: OpenApi::Schemas::V1::Users::USER_OBJECT
        }
      }
    }
  }
end
