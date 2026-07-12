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

  # def error_response(message: "", errors: [], status: :unprocessable_content)
  #   render json: {
  #     status: {
  #       code: Rack::Utils::SYMBOL_TO_STATUS_CODE[status],
  #       message: message
  #     },
  #     errors: errors
  #   }, status: status
  # end

  def error_response(
    message: "",
    errors: [],
    status: :unprocessable_content
  )
    render json: ApiErrorResponse.body(
      message: message,
      errors: errors,
      status: status
    ),
    status: status
  end
end
