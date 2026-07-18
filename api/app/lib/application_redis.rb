# ApplicationRedis layer to prevent direct access to REDIS from being spread throughout
# the application.

class ApplicationRedis
  PREFIX = Rails.application.class.module_parent_name
    .underscore
    .tr("_", "-")

  def self.with
    yield REDIS
  end
end
