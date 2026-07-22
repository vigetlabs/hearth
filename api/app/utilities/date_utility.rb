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
end
