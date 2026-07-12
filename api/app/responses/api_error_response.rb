class ApiErrorResponse
  def self.build(
    type:,
    code:,
    message:,
    status:,
    **metadata
  )
    error = {
      type: type,
      code: code,
      **metadata.compact
    }

    {
      status: {
        code: Rack::Utils::SYMBOL_TO_STATUS_CODE[status],
        message: message
      },
      error: error
    }
  end

  def self.validation(message:, details:)
    build(
      type: ApiErrorTypes::VALIDATION,
      code: ApiErrorCodes::Validation::INVALID_ATTRIBUTES,
      message: message,
      status: :unprocessable_content,
      details: details
    )
  end

  def self.authentication(code:, message:)
    build(
      type: ApiErrorTypes::AUTHENTICATION,
      code: code,
      message: message,
      status: :unauthorized
    )
  end

  def self.not_found(resource:, message:)
    build(
      type: ApiErrorTypes::NOT_FOUND,
      code: ApiErrorCodes::NotFound::RESOURCE_NOT_FOUND,
      resource: resource,
      message: message,
      status: :not_found
    )
  end

  def self.bad_request(code:, message:, field: nil, **metadata)
    build(
      type: ApiErrorTypes::BAD_REQUEST,
      code: code,
      status: :bad_request,
      message: message,
      field: field,
      **metadata
    )
  end
end
