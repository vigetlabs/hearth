module OpenApi::Schemas::V1::Users
  CREATE_USER_REQUEST = {
    type: :object,
    required: %w[user],
    properties: {
      user: {
        type: :object,
        required: %w[
          email
          first_name
          last_name
          password
          password_confirmation
        ],
        properties: {
          email: { type: :string, format: :email },
          first_name: { type: :string },
          last_name: { type: :string },
          password: { type: :string, format: :password },
          password_confirmation: { type: :string, format: :password }
        }
      }
    }
  }
end
