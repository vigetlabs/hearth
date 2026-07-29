module Slack
  class WeekScheduleFormatter
    def initialize(dates:, visits:)
      @dates = dates
      @visits = visits
    end

    def call
      dates
        .map { |date| format_schedule_date(date) }
        .join("\n")
    end

    private

    attr_reader :dates, :visits

    def format_schedule_date(date)
      visit = visits_by_date[date]

      "*#{format_date(date)}* - #{format_location(visit)}"
    end

    def format_location(visit)
      return ":house: Out" unless visit

      "#{visit.office.emoji} #{visit.office.name.titleize}"
    end

    def format_date(date)
      date.strftime("%a, %b, %-d")
    end

    def visits_by_date
      @visits_by_date ||= visits.index_by(&:visit_date)
    end
  end
end
