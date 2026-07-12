module ApiResponse
  extend ActiveSupport::Concern

  def success_response(data: nil, message: "", status: :ok)
    render json: {
      status: {
        code: Rack::Utils::SYMBOL_TO_STATUS_CODE[status],
        message: message
      },
      data: data
    }, status: status
  end

   def error_response(
    message: "",
    errors: [],
    status: :unprocessable_content,
    type: "",
    code: ""
  )
    render json: ApiErrorResponse.body(
      message: message,
      errors: errors,
      status: status,
      type: type,
      code: code
    ),
    status: status
  end
end
