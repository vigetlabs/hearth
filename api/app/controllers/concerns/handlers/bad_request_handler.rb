module Handlers
  module BadRequestHandler
    extend ActiveSupport::Concern

    def handle_missing_parameter(exception)
      render json: ApiErrorResponse.bad_request(
        code: ApiErrorCodes::BadRequest::MISSING_PARAMETER,
        message: "A required parameter is missing.",
        metadata: {
          parameter: exception.param
        }
      ), status: :bad_request
    end
  end
end
