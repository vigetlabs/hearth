module Helpers
  module FrontendPathHelper
    extend ActiveSupport::Concern

    private

    def frontend_url
      Rails.configuration.x.frontend_url
    end

    def frontend_path(path)
      "#{frontend_url}#{path}"
    end
  end
end
