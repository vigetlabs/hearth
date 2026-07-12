class ApiErrorResponse
  def self.body(message:, errors:, status:)
    {
      status: {
        code: Rack::Utils::SYMBOL_TO_STATUS_CODE[status],
        message: message
      },
      errors: errors
    }
  end

  # This function is just to format Devise's default error formatting.
  #
  # Refer to `app/failures` to see `ApiErrorResponse.authentication(...) usage.
  def self.authentication(
    field: "Authentication",
    message: "You need to sign in before continuing"
  )
    body(
      message: "Unauthorized",
      status: :unauthorized,
      errors: [
        {
          field: field,
          message: message
        }
      ]
    )
  end
end
