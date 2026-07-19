# typed: strict

class OfficePlanningStore
  extend T::Sig

  STALE_AFTER = T.let(2.minutes, ActiveSupport::Duration)

  SELECTED = "selected"
  DESELECTED = "deselected"

  sig { params(office_id: Integer, redis: Redis).void }
  def initialize(office_id:, redis: REDIS)
    @office_id = office_id
    @redis = redis
  end

  sig { params(date: String, user_id: Integer).void }
  def select(date:, user_id:)
    ApplicationRedis.with do |redis|
      redis.multi do |transaction|
        transaction.zrem(
          create_office_planning_key(date:, variation: DESELECTED),
          user_id
        )

        transaction.zadd(
          create_office_planning_key(date:, variation: SELECTED),
          expires_at,
          user_id
        )
      end
    end
  end

  sig { params(date: String, user_id: Integer).void }
  def deselect(date:, user_id:)
    ApplicationRedis.with do |redis|
      redis.multi do |transaction|
        transaction.zrem(
          create_office_planning_key(date:, variation: SELECTED),
          user_id
        )

        transaction.zadd(
          create_office_planning_key(date:, variation: DESELECTED),
          expires_at,
          user_id
        )
      end
    end
  end

  sig do
    params(
      selected_dates: T::Array[String],
      deselected_dates: T::Array[String],
      user_id: Integer
    ).void
  end
  def heartbeat(selected_dates:, deselected_dates:, user_id:)
    ApplicationRedis.with do |redis|
      redis.multi do |transaction|
        selected_dates.each do |date|
          transaction.zrem(
            create_office_planning_key(date:, variation: DESELECTED),
            user_id
          )

          transaction.zadd(
            create_office_planning_key(date:, variation: SELECTED),
            expires_at,
            user_id
          )
        end

        deselected_dates.each do |date|
          transaction.zrem(
            create_office_planning_key(date:, variation: SELECTED),
            user_id
          )

          transaction.zadd(
            create_office_planning_key(date:, variation: DESELECTED),
            expires_at,
            user_id
          )
        end
      end
    end
  end

  sig { params(date: String).returns(T::Array[Integer]) }
  def selected_user_ids(date:)
    remove_stale(date:)

    ApplicationRedis.with do |redis|
      redis
        .zrange(create_office_planning_key(date:, variation: SELECTED), 0, -1)
        .map(&:to_i)
    end
  end

  sig { params(date: String).returns(T::Array[Integer]) }
  def deselected_user_ids(date:)
    remove_stale(date:)

    ApplicationRedis.with do |redis|
      redis
        .zrange(create_office_planning_key(date:, variation: DESELECTED), 0, -1)
        .map(&:to_i)
    end
  end

  private

  sig { params(date: String).void }
  def remove_stale(date:)
    ApplicationRedis.with do |redis|
      redis.zremrangebyscore(
        create_office_planning_key(date:, variation: SELECTED),
        "-inf",
        Time.current.to_f
      )
    end

    ApplicationRedis.with do |redis|
      redis.zremrangebyscore(
        create_office_planning_key(date:, variation: DESELECTED),
        "-inf",
        Time.current.to_f
      )
    end
  end

  sig { returns(Float) }
  def expires_at
      STALE_AFTER.from_now.to_f
  end

  sig { params(date: String, variation: String).returns(String) }
  def create_office_planning_key(date:, variation:)
    normalized_date = DateUtility.normalize_to_string(date)

    raise ArgumentError, "Invalid date provided for Redis key" if normalized_date.nil?

    [
      ApplicationRedis::PREFIX,
      "office-planning",
      "office",
      @office_id,
      "date",
      normalized_date,
      variation
    ].join(":")
  end
end
