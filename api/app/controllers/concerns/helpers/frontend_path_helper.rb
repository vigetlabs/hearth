module Helpers
  module FrontendPathHelper
    extend ActiveSupport::Concern

    private

    def frontend_url
      Rails.application.credentials.dig(:google, :frontend_url)
    end

    def frontend_path(path)
      "#{frontend_url}#{path}"
    end
  end
end
