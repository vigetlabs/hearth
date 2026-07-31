# typed: strict

class OfficeAttendanceEditingStore
  extend T::Sig

  STALE_AFTER = T.let(1.minutes, ActiveSupport::Duration)

  sig { params(office_id: Integer).void }
  def initialize(office_id:)
    @office_id = office_id
  end

  sig { params(week_start: String, user_id: Integer).void }
  def start_editing(week_start:, user_id:)
    ApplicationRedis.with do |redis|
      redis.zadd(
        create_office_attendance_editing_key(week_start:),
        Calendar::TtlCalculator.expires_at(STALE_AFTER),
        user_id
      )
    end
  end

  sig { params(week_start: String, user_id: Integer).void }
  def heartbeat(week_start:, user_id:)
    start_editing(
      week_start:,
      user_id:
    )
  end

  sig { params(week_start: String, user_id: Integer).void }
  def stop_editing(week_start:, user_id:)
    ApplicationRedis.with do |redis|
      redis.zrem(
        create_office_attendance_editing_key(week_start:),
        user_id
      )
    end
  end

  sig { params(week_start: String).returns(T::Array[Integer]) }
  def editing_user_ids(week_start:)
    remove_stale(week_start:)

    ApplicationRedis.with do |redis|
      redis
        .zrange(create_office_attendance_editing_key(week_start:), 0, -1)
        .map(&:to_i)
    end
  end

  private

  sig { params(week_start: String).void }
  def remove_stale(week_start:)
    ApplicationRedis.with do |redis|
      redis.zremrangebyscore(
        create_office_attendance_editing_key(week_start:),
        0,
        Time.current.to_i
      )
    end
  end

  sig { params(week_start: String).returns(String) }
  def create_office_attendance_editing_key(week_start:)
    normalized_week_start = Calendar::DateUtility.normalize_to_string(week_start)
    raise ArgumentError, "Invalid data provided for Redis key" if normalized_week_start.nil?

    [
      ApplicationRedis::PREFIX,
      "office-attending",
      "office",
      @office_id,
      "week",
      normalized_week_start,
      "editing"
    ].join(":")
  end
end
