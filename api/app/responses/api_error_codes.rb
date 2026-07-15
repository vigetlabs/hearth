module ApiErrorCodes
  module Authentication
    AUTHENTICATION_REQUIRED = "authentication_required"
    INVALID_CREDENTIALS = "invalid_credentials"
  end

  module Validation
    INVALID_ATTRIBUTES = "invalid_attributes"
  end

  module NotFound
    RESOURCE_NOT_FOUND = "resource_not_found"
  end

  module BadRequest
    BAD_REQUEST = "bad_request"
    MISSING_PARAMETER = "missing_parameter"
    MALFORMED_JSON = "malformed_json"
    INVALID_PARAMETER_FORMAT = "invalid_parameter_format"
  end
end
