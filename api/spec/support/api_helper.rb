module ApiHelper
  def api_path(path)
    "/api/v1#{path}"
  end
end

RSpec.configure do |config|
  config.include ApiHelper, type: :request
end

