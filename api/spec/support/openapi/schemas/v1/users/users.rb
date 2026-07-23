module OpenApi::Schemas::V1::Users
  # USER_OBJECT: Public user object returned by the API
  #
  # This is not a full response body. It only describes the user resource itself. Sensitive feilds like password and
  # encrypted passwords should never be included in this schema
  #
  USER_OBJECT = {
    type: :object,
    description: "Public user account data returned by the API.",
    required: %w[
      id
      email
      first_name
      last_name
      office
    ],
    properties: {
      id: { type: :integer },
      email: { type: :string, format: :email },
      first_name: { type: :string },
      last_name: { type: :string },
      office: {
        type: :object,
        nullable: true,
        required: %w[
          id
          name
        ],
        properties: {
          id: { type: :integer },
          name: { type: :string }
        }
      },
      default_schedule: {
        nullable: true,
        allOf: [
          OpenApi::Schemas::V1::Schedules::SCHEDULE_OBJECT
        ]
      },
      lab: { type: :string }
    }
  }

  # CREATE_USER_REQUEST: Request body for creating a user account
  #
  # Use this as the request body schema for `POST /api/v1/users`. This schema includes password fields because
  # clients need to submit them when creating an account. These fields do not appear in USER_OBJECT
  CREATE_USER_REQUEST = {
    type: :object,
    description: "Request body for creating a new user account",
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

  # LOGIN_USER_REQUEST: Request body for logging in to a user account
  #
  # Use this as the request body schema for `POST /api/v1/users/login`. This schema includes credentials the client
  # must submit to authenticate
  LOGIN_USER_REQUEST = {
    type: :object,
    description: "Request body for logging in to a user account.",
    required: %w[user],
    properties: {
      user: {
        type: :object,
        description: "Credentials for the user account being authenticated.",
        required: %w[email password],
        properties: {
          email: {
            type: :string,
            format: :email
          },
          password: {
            type: :string,
            format: :password,
            writeOnly: true
          }
        }
      }
    }
  }

  # USER_RESPONSE: Full response body for returning one user
  #
  # Use this when an endpoint returns a single user wrapped in the standard API response structure. Examples include
  # successful registration, reading the current user, or updating account information
  USER_RESPONSE = {
    type: :object,
    description: "Full response body for endpoints that return one user.",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        type: :object,
        required: %w[user],
        properties: {
          user: USER_OBJECT
        }
      }
    }
  }

  # USERS_RESPONSE: Full response body for returning multiple users
  #
  # Use this when an endpoint returns multiple users wrapped in the standard API response response structure. Examples
  # include successful querying users by office id to build office roster
  USERS_RESPONSE = {
    type: :object,
    description: "Full response body for endpoints that return multiple users.",
    required: %w[status data],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      data: {
        type: :object,
        required: %w[users],
        properties: {
          users: {
            type: :array,
            items: USER_OBJECT
          }
        }
      }
    }
  }

  # CREATE_USER_REQUEST: Request body for updating current authenticated user
  #
  # Use this as the request body schema for `PATCH /api/v1/users/me`.
  PATCH_USER_REQUEST = {
    type: :object,
    description: "Request body for updating the current user's account information.",
    required: %w[user],
    additionalProperties: false,
    properties: {
      user: {
        type: :object,
        description: "User attributes available to be updated.",
        minProperties: 1,
        additionalProperties: false,
        properties: {
          first_name: {
            type: :string,
            example: "Ryan"
          },
          last_name: {
            type: :string,
            example: "Dioneda"
          },
          office_id: {
            type: :integer,
            example: 1
          },
          default_schedule: OpenApi::Schemas::V1::Schedules::SCHEDULE_ATTRIBUTES
        }
      }
    }
  }
end
