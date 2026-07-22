# typed: strict

class DateUtility
  extend T::Sig

  DateValue = T.type_alias do
    T.any(Date, Time, DateTime, String)
  end

  DateValues = T.type_alias do
    T.nilable(
      T.any(
        DateValue,
        T::Array[DateValue]
      )
    )
  end

  sig { params(date_value: DateValue).returns(T.nilable(String)) }
  def self.normalize_to_string(date_value)
    resolved_date = case date_value
    when Time, DateTime
      date_value.to_date
    when Date
      date_value
    when String
      Date.iso8601(date_value)
    end
    resolved_date.iso8601
  rescue Date::Error, TypeError
    nil
  end

  sig { params(date_values: DateValues).returns(T::Array[String]) }
  def self.validate_dates(date_values)
    Array(date_values)
      .filter_map { |date| normalize_to_string(date) }
      .uniq
  end

  sig { params(value: T.untyped).returns(Date) }
  def self.normalize_week_start(value)
    date = Date.iso8601(value.to_s)
    date.beginning_of_week(:monday)
  rescue Date::Error
    raise ArgumentError, "Invalid date"
  end

  sig { params(value: T.untyped).returns(Date) }
  def self.normalize_week_end(value)
    date = Date.iso8601(value.to_s)
    date.end_of_week(:sunday)
  rescue Date::Error
    raise ArgumentError, "Invalid date"
  end

  sig { params(week_start: Date).returns(T::Array[String]) }
  def self.week_dates(week_start)
    (week_start..(week_start + 4.days)).map(&:iso8601)
  end
end
