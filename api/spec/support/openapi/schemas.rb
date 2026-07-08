module OpenApi
  module Schemas
    module V1
      module Statuses
      end

      module Users
      end

      module Errors
      end
    end
  end
end

require_relative "schemas/v1/statuses/status"

require_relative "schemas/v1/errors/error_response"

require_relative "schemas/v1/users/user"
require_relative "schemas/v1/users/user_response"
require_relative "schemas/v1/users/create_user_request"
