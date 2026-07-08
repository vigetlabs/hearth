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
