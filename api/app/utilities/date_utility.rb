class DateUtility
  def self.normalize_to_string(date_value)
    resolved_date = case date_value
    when Date
                      date_value
    when Time, DateTime
                      date_value.to_date
    when String
                      Date.iso8601(date_value)
    end
    resolved_date&.iso8601
  rescue Date::Error, TypeError
    nil
  end

  def self.validate_dates(date_values)
    Array(date_values)
      .filter_map { |date| normalize_to_string(value) }
      .uniq
  end
end
