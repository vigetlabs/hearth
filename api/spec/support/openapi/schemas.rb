module OpenApi
  module Schemas
    module V1
      module Statuses
      end
      module Errors
      end

      module Generics
      end

      module Schedules
      end

      module Offices
      end

      module Visits
      end

      module Users
      end

      module AttendanceConfirmations
      end
    end
  end
end

require_relative "schemas/v1/statuses/status"
require_relative "schemas/v1/errors/errors"
require_relative "schemas/v1/generics/generics"
require_relative "schemas/v1/schedules/schedules"
require_relative "schemas/v1/offices/offices"
require_relative "schemas/v1/users/users"
require_relative "schemas/v1/visits/visits"
require_relative "schemas/v1/attendance_confirmations/attendance_confirmations"
