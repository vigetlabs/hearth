module OpenApi::Schemas::V1::Statuses
  # STATUS_OBJECT: Shared status metadata returned by API responses
  #
  # This is not a full response body. It is a reusable nested object that gives clients a machine
  # readable status code and a human-readable message
  STATUS_OBJECT = {
    type: :object,
    description: "Shared status metadata returned by API responses.",
    required: %w[message],
    properties: {
      message: { type: :string }
    }
  }
end
