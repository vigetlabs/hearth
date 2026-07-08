module OpenApi::Schemas::V1::Statuses
  STATUS_OBJECT = {
    type: :object,
    required: %w[message],
    properties: {
      message: { type: :string }
    }
  }
end
