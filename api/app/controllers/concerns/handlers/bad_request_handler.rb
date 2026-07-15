module Handlers
  module BadRequestHandler
    extend ActiveSupport::Concern

    # missing a top level key such as `visits` (any required param)
    def handle_missing_parameter(exception)
      render json: ApiErrorResponse.bad_request(
        code: ApiErrorCodes::BadRequest::MISSING_PARAMETER,
        message: "A required parameter is missing.",
        parameter: exception.param
      ), status: :bad_request
    end

    # bad request such as having 'date' string when Date string object expected
    def handle_bad_request(exception)
      render json: ApiErrorResponse.bad_request(
        code: ApiErrorCodes::BadRequest::BAD_REQUEST,
        message: exception.message
      ), status: :bad_request
    end
  end
end
