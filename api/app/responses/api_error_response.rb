class ApiErrorResponse
  def self.body(message:, errors:, status:, type:, code:)
    {
      status: {
        code: Rack::Utils::SYMBOL_TO_STATUS_CODE[status],
        message: message
      },
      error: {
        type: type,
        code: code
      },
      errors: errors
    }
  end

  # This function is just to format Devise's default error formatting.
  #
  # Refer to `app/failures` to see `ApiErrorResponse.authentication(...) usage.
  def self.authentication(
    code: ErrorCodeGenerator.authentication_required,
    field: "authentication",
    message: "You need to sign in before continuing"
  )
    body(
      message: "unauthorized",
      status: :unauthorized,
      type: ErrorTypeGenerator.authentication_error,
      code: code,
      errors: [
        {
          field: field,
          message: message
        }
      ]
    )
  end
end
