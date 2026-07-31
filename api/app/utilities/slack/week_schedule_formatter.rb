module Slack
  class WeekScheduleFormatter
    def initialize(
      dates:,
      visits:,
      selected_dates:,
      default_office:
    )
      @dates = dates
      @visits = visits
      @selected_dates = selected_dates
      @default_office = default_office
    end

    def call
      dates
        .map { |date| format_schedule_date(date) }
        .join("\n")
    end

    private

    attr_reader(
      :dates,
      :visits,
      :selected_dates,
      :default_office
    )

    def format_schedule_date(date)
      visit = visits_by_date[date]

      "*#{format_date(date)}* - #{format_location(date, visit)}"
    end

    def format_location(date, visit)
      return format_office(visit.office) if visit
      return format_office(default_office) if selected_dates.include?(date)

      ":house: Out"
    end

    def format_office(office)
      "#{office.emoji} #{office.name.titleize}"
    end

    def format_date(date)
      date.strftime("%a, %b %-d")
    end

    def visits_by_date
      @visits_by_date ||= visits.index_by(&:visit_date)
    end
  end
end
