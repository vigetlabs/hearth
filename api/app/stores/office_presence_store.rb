class OfficePresenceStore
  STALE_AFTER = 90.seconds

  def initialize(office_id:)
    @office_id = office_id
  end

  def register(user_id:, connection_id:)
    ApplicationRedis.with do |redis|
      redis.zadd(
        office_presence_redis_key,
        expires_at,
        member(user_id:, connection_id:)
      )
    end
  end

  def heartbeat(user_id:, connection_id:)
    register(user_id:, connection_id:)
  end

  def remove(user_id:, connection_id:)
    ApplicationRedis.with do |redis|
      redis.zrem(
        office_presence_redis_key,
        member(user_id:, connection_id:)
      )
    end
  end

  def active_user_ids
    remove_stale

    ApplicationRedis.with do |redis|
      redis
        .zrange(office_presence_redis_key, 0, -1)
        .filter_map { |value| parse_user_id(value) }
        .uniq
    end
  end

  private

  def remove_stale
    ApplicationRedis.with do |redis|
      redis.zremrangebyscore(
        office_presence_redis_key,
        "-inf",
        Time.current.to_f
      )
    end
  end

  private

  attr_reader :office_id, :redis

  def office_presence_redis_key
    [
      ApplicationRedis::PREFIX,
      "office-presence",
      "office",
      office_id
    ].join(":")
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
