module OpenApi::Schemas::V1::Users
  USER_OBJECT = {
    type: :object,
    required: %w[
      id
      email
      first_name
      last_name
    ],
    properties: {
      id: { type: :integer },
      email: { type: :string, format: :email },
      first_name: { type: :string },
      last_name: { type: :string }
    }
  }
end
