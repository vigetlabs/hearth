module Handlers
  module RecordInvalidHandler
    extend ActiveSupport::Concern

    include Helpers::ValidationErrorFormatterHelper

    def handle_invalid_record(exception)
      render json: ApiErrorResponse.validation(
        message: "Validation failed.",
        details: format_validation_errors(exception.record)
      ), status: :unprocessable_content
    end
  end
end
