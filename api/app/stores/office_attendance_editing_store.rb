# typed: strict

class OfficeAttendanceEditingStore
  extend T::Sig

  include TtlCalculator

  STALE_AFTER = T.let(1.minutes, ActiveSupport::Duration)

  sig { params(office_id: Integer, redis: Redis).void }
  def initialize(office_id:, redis: REDIS)
    @office_id = office_id
    @redis = redis
  end

  sig { params(week_start: String, user_id: Integer).void }
  def select_editing(week_start:, user_id:)
    ApplicationRedis.with do |redis|
      redis.zadd(
        create_office_attendance_editing_key(week_start:),
        expires_at(stale_after: STALE_AFTER),
        user_id
      )
    end
  end

  private

  sig { params(week_start: String).returns(String) }
  def create_office_attendance_editing_key(week_start:)
    normalized_week_start = DateUtility.normalize_to_string(week_start)

    raise ArgumentError, "Invalid data provided for Redis key" if normalized_week_start.nil?

    [
      ApplicationRedis::PREFIX,
      "office-attending",
      "office",
      @office_id,
      "week",
      week_start,
      "editing"
    ].join(":")
  end
end
