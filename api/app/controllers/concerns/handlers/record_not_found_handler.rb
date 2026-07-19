module Handlers
  module RecordNotFoundHandler
    extend ActiveSupport::Concern

    def handle_record_not_found(exception)
      resource = exception.model.to_s.underscore

      render json: ApiErrorResponse.not_found(
        resource: resource,
        message: "Failed to find #{resource}"
      ), status: :not_found
    end
  end
end
