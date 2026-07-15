module OpenApi::Schemas::V1::Errors
  # FIELD_ERROR: One individual error detail, not a full API response
  #
  # Use this as an item inside an `errors` array when the API needs to describe exactly waht failed. This is commonly used for
  # validation errors where the frontend needs to know which field failed and what message to show. On its own,
  # FIELD_ERROR is not a complete response body
  FIELD_ERROR = {
    type: :object,
    description: "One individual field error, usually used inside an errors array.",
    required: %w[field message],
    properties: {
      field: { type: :string },
      message: { type: :string }
    }
  }

  # VALIDATION_ERROR_RESPONSE: Full response body for validation errors
  #
  # Use this when submitted data fails validation. Examples include a failed user registation, failed profile update,
  # or any request where the server needs to return both a general failure message and specific field-level errors
  VALIDATION_ERROR_RESPONSE = {
    type: :object,
    description: "Full response body for validation errors with field-level details.",
    required: %w[status error],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      error: {
        type: :object,
        required: %w[type code details],
        properties: {
          type: {
            type: :string,
            enum: [
              ApiErrorTypes::VALIDATION
            ]
          },
          code: {
            type: :string,
            enum: [
              ApiErrorCodes::Validation::INVALID_ATTRIBUTES
            ]
          },
          details: {
            type: :array,
            items: FIELD_ERROR
          }
        }
      }
    }
  }

  # AUTHENTICATION_ERROR_RESPONSE: Full response body for authentication errors
  #
  # Use this when the request cannot be completed because the user is not authenticated or the supplied credentials are invalid.
  # Examples include a missing valid session, invalid token, or incorrect login credentials
  AUTHENTICATION_ERROR_RESPONSE = {
    type: :object,
    description: "Full response body for invalid active sessions.",
    required: %w[status error],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      error: {
        type: :object,
        required: %w[type code],
        properties: {
          type: {
            type: :string,
            enum: [
              ApiErrorTypes::AUTHENTICATION
            ]
          },
          code: {
            type: :string,
            enum: [
              ApiErrorCodes::Authentication::AUTHENTICATION_REQUIRED,
              ApiErrorCodes::Authentication::INVALID_CREDENTIALS
            ]
          }
        }
      }
    }
  }

  # NOT_FOUND_ERROR_RESPONSE: Full response body for missing resources
  #
  # Use this when the requested resource does not exist or cannot be found within the current request context. Examples include
  # requesting an unknown office, schedule, visit, or user.
  NOT_FOUND_ERROR_RESPONSE = {
    type: :object,
    description: "Full response body for record not found errors.",
    required: %w[status error],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      error: {
        type: :object,
        required: %w[type code resource],
        properties: {
          type: {
            type: :string,
            enum: [
              ApiErrorTypes::NOT_FOUND
            ]
          },
          code: {
            type: :string,
            enum: [
              ApiErrorCodes::NotFound::RESOURCE_NOT_FOUND
            ]
          },
          resource: {
            type: :string,
            enum: %w[
              user
              office
              schedule
              visit
            ]
          }
        }
      }
    }
  }

  BAD_REQUEST_ERROR_RESPONSE = {
    type: :object,
    description: "Full response body for malformed request bodies.",
    required: %w[status error],
    properties: {
      status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,
      error: {
        type: :object,
        required: %w[type code],
        properties: {
          type: {
            type: :string,
            enum: [
              ApiErrorTypes::BAD_REQUEST
            ]
          },
          code: {
            type: :string,
            enum: [
              ApiErrorCodes::BadRequest::BAD_REQUEST,
              ApiErrorCodes::BadRequest::MISSING_PARAMETER,
              ApiErrorCodes::BadRequest::MALFORMED_JSON,
              ApiErrorCodes::BadRequest::INVALID_PARAMETER_FORMAT
            ]
          },
          field: {
            type: :string,
            nullable: true,
            example: "user"
          }
        }
      }
    }
  }
end
