class OfficePresenceStore
  STALE_AFTER = 90.seconds

  def initialize(office_id:, redis: REDIS)
    @office_id = office_id
    @redis = redis
  end

  def heartbeat(user_id:, connection_id:)
    register(user_id:, connection_id:)
  end

  def register(user_id:, connection_id:)
    redis.zadd(
      redis_key,
      expires_at,
      member(user_id:, connection_id:)
    )
  end

  def remove(user_id:, connection_id:)
    redis.zrem(
      redis_key,
      member(user_id:, connection_id:)
    )
  end

  def active_user_ids
    remove_stale

    redis
      .zrange(redis_key, 0, -1)
      .filter_map { |value| parse_user_id(value) }
      .uniq
  end

  def remove_stale
    redis.zremrangebyscore(
      redis_key,
      "-inf",
      Time.current.to_f
    )
  end

  private

  attr_reader :office_id, :redis

  def redis_key
    "office_presence:office:#{office_id}"
  end


  def member(user_id:, connection_id:)
    "#{user_id}:#{connection_id}"
  end

  def expires_at
    STALE_AFTER.from_now.to_f
  end

  def parse_user_id(value)
    user_id, = value.split(":", 2)
    Integer(user_id, exception: false)
  end
end
