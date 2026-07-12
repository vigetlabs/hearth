class ApiErrorResponse
  def self.build(
    type:,
    code:,
    message:,
    status:,
    **metadata
  )
    {
      status: {
        code: Rack::Utils::SYMBOL_TO_STATUS_CODE.fetch(status),
        message: message
      },
      error: {
        type: type,
        code: code,
        **metadata.compact
      }
    }
  end

  def self.validation(message:, details:)
    build(
      type: ApiErrorTypes::VALIDATION,
      code: ApiErrorCodes::Validation::INVALID_ATTRIBUTES,
      message: message,
      status: :unprocessable_content,
      details: details,
    )
  end

  def self.authentication(code:, message:)
    build(
      type: ApiErrorTypes::AUTHENTICATION,
      code: code,
      message: message,
      status: :unauthorized,
    )
  end

  def self.not_found(resource:, message:)
    build(
      type: ApiErrorTypes::NOT_FOUND,
      code: ApiErrorCodes::NotFound::RESOURCE_NOT_FOUND,
      message: message,
      status: :not_found,
      resource: resource,
    )
  end

  def self.bad_request(code:, message:, **metadata)
    build(
      type: ApiErrorTypes::BAD_REQUEST,
      code: code,
      message: message,
      status: :bad_request,
      **metadata
    )
  end
end
