module Handlers
  module RecordNotFoundHandler
    extend ActiveSupport::Concern

    def handle_record_not_found(exception)
      model_class = exception.model.to_s.safe_constantize

      field_name = model_class ? model_class.primary_key : "id"
      model_name = exception.model.underscore
      error_code = ErrorCodeGenerator.resource_not_found(model_name)

      # required to match the schema of record_not_found_response
      formatted_error = [
        {
          field: field_name,
          message: "#{model_name} not found"
        }
      ]

      error_response(
        message: "Failed to find #{model_name}",
        errors: formatted_errors,
        type: ErrorTypeGenerator.not_found_error,
        code: error_code
      )
    end
  end
end
