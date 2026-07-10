module OpenApi::Schemas::V1::Users
  # USER_OBJECT: Public user object returned by the API
  #
  # This is not a full response body. It only describes the user resource itself. Sensitive feilds like password and
  # encrypted passwords should never be included in this schema
  #
  # @NOTE office_id and default_schedule properties should later be included in the required array once controller
  # can return them
  USER_OBJECT = {
    type: :object,
    description: "Public user account data returned by the API.",
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
      last_name: { type: :string },
      office_id: {
        type: :integer,
        nullable: true
      },
      default_schedule: OpenApi::Schemas::V1::Schedules::SCHEDULE_OBJECT
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
          user: OpenApi::Schemas::V1::Users::USER_OBJECT
        }
      }
    }
  }

  # USER_DEVISE_INVALID_LOGIN_RESPONSE: Full response body for indicating an unauthorized login
  #
  # Use this when this login endpoint rejects invalid credentials. This represents Devise's
  # default unauthorized response body, not the app's custom ApiResponse error shape
  USER_DEVISE_INVALID_LOGIN_RESPONSE = {
    type: :object,
    description: "Full response body for invalid login request",
    required: [ "error" ],
    properties: {
      error: {
        type: :string,
        description: "Devise authentication error message",
        example: "Invalid Email or password."
      }
    }
  }
end
