module Helpers
  module ValidationErrorFormatterHelper
    extend ActiveSupport::Concern

    def format_validation_errors(record)
      record.errors.map do |error|
        {
          field: error.attribute.to_s,
          message: error.message
        }
      end
    end
  end
end
