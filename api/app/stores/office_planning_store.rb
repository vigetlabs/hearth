# typed: strict

class OfficePlanningStore
  extend T::Sig

  STALE_AFTER = T.let(2.minutes, ActiveSupport::Duration)

  sig { params(office_id: Integer, redis: Redis).void }
  def initialize(office_id:, redis: REDIS)
    @office_id = office_id
    @redis = redis
  end

  sig { params(date: String, user_id: Integer).void }
  def select(date:, user_id:)
    ApplicationRedis.with do |redis|
      redis.zadd(
        office_planning_redis_key(date:),
        expires_at,
        user_id
      )
    end
  end

  sig { params(date: String, user_id: Integer).void }
  def heartbeat(date:, user_id:)
    select(date:, user_id:)
  end

  sig { params(date: String, user_id: Integer).void }
  def deselect(date:, user_id:)
    ApplicationRedis.with do |redis|
      redis.zrem(
        office_planning_redis_key(date:),
        user_id
      )
    end
  end

  sig { params(date: String).returns(T::Array[Integer]) }
  def selected_user_ids(date:)
    remove_stale(date:)

    ApplicationRedis.with do |redis|
      redis
        .zrange(office_planning_redis_key(date:), 0, -1)
        .map(&:to_i)
    end
  end

  private

  sig { params(date: String).void }
  def remove_stale(date:)
    ApplicationRedis.with do |redis|
      redis.zremrangebyscore(
        office_planning_redis_key(date:),
        "-inf",
        Time.current.to_f
      )
    end
  end

  sig { params(date: String).returns(String) }
  def office_planning_redis_key(date:)
    normalized_date = DateUtility.normalize_to_string(date)

    raise ArgumentError, "Invalid date provided for Redis key" if normalized_date.nil?

    [
      ApplicationRedis::PREFIX,
      "office-planning",
      "office",
      @office_id,
      "date",
      normalized_date
    ].join(":")
  end

  sig { returns(Float) }
  def expires_at
      STALE_AFTER.from_now.to_f
  end
end
