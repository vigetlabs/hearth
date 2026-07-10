module RecordInvalidHandler
  extend ActiveSupport::Concern

  def handle_invalid_record(exception)
    model_name = exception.record.class.name.underscore

    # required to match the schema of validation_error_response
    formatted_errors = exception.record.errors.map do |error|
      {
        field: error.attribute.to_s,
        message: error.message
      }
    end

    error_response(
      message: "Failed to create #{model_name}",
      errors: formatted_errors
    )
  end
end
