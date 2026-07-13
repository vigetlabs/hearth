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
end
