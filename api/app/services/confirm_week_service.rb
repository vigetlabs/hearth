# typed: strict

class ConfirmWeekService
  extend T::Sig

  class AlreadyConfirmedError < StandardError; end
  class InvalidDateError < StandardError; end
  class ConflictingVisitError < StandardError; end

  class ConfirmResult < T::Struct
    const :confirmation, AttendanceConfirmation
    const :visits, T::Array[Visit]
  end

  sig do
    params(
      user: User,
      office: Office,
      week_start: Date,
      selected_dates: T::Array[Date]
    ).void
  end
  def initialize(
    user:,
    office:,
    week_start:,
    selected_dates:
  )
    @user = user
    @office = office
    @week_start = week_start
    @selected_dates = selected_dates
  end

  sig { returns(ConfirmResult) }
  def call
    validate_selected_dates!
    validate_no_conflicting_visits!

    confirmation = T.let(nil, T.nilable(AttendanceConfirmation))
    visits = T.let([], T::Array[Visit])

    ApplicationRecord.transaction do
      ensure_not_already_confirmed!

      synchronize_visits!

      confirmation = create_confirmation!
      visits = confirmed_visits.to_a
    end

    ConfirmResult.new(
      confirmation: T.must(confirmation),
      visits: visits
    )
  end

  private

  sig { returns(User) }
  attr_reader :user
  sig { returns(Office) }
  attr_reader :office
  sig { returns(Date) }
  attr_reader :week_start
  sig { returns(T::Array[Date]) }
  attr_reader :selected_dates

  sig { returns(T::Range[Date]) }
  def week_range
    normalized_week_start..normalized_week_end
  end

  sig { returns(Date) }
  def normalized_week_start
    @normalized_week_start ||=
      T.let(
        week_start.beginning_of_week(:monday),
        T.nilable(Date)
      )
  end

  sig { returns(Date) }
  def normalized_week_end
    normalized_week_start + 4.days
  end

  sig { returns(T::Array[Date]) }
  def normalized_selected_dates
    @normalized_selected_dates ||=
      T.let(
        selected_dates.uniq.sort,
        T.nilable(T::Array[Date])
      )
  end

  sig { void }
  def validate_selected_dates!
    invalid_dates =
      normalized_selected_dates.reject do |date|
        week_range.cover?(date)
      end

    return if invalid_dates.empty?

    raise InvalidDateError,
      "Selected dates must fall within the confirmed week"
  end

  sig { void }
  def ensure_not_already_confirmed!
    existing_confirmation =
      AttendanceConfirmation.find_by(
        user:,
        office:,
        period_type: :week,
        starts_on: normalized_week_start
      )

    return unless existing_confirmation

    raise AlreadyConfirmedError,
      "This attendance week has already been confirmed"
  end

  sig { void }
  def validate_no_conflicting_visits!
    conflict =
      Visit
        .where(
          user: user,
          visit_date: normalized_selected_dates
        )
        .where.not(office: office)
        .first

      return unless conflict

      raise ConflictingVisitError,
        "A selected date already has a visit in another office"
  end

  sig { void }
  def synchronize_visits!
    remove_unselected_visits!
    persist_selected_visits!
  end

  sig { void }
  def remove_unselected_visits!
    visits =
      Visit.where(
        user: user,
        office: office,
        visit_date: week_range
      )

    if normalized_selected_dates.empty?
      visits.destroy_all
      return
    end

    visits
      .where.not(visit_date: normalized_selected_dates)
      .destroy_all
  end

  sig { void }
  def persist_selected_visits!
    normalized_selected_dates.each do |date|
      visit =
        Visit.find_or_initialize_by(
          user: user,
          visit_date: date
        )

      visit.update!(
        office: office,
      )
    end
  end

  sig { returns(AttendanceConfirmation) }
  def create_confirmation!
    AttendanceConfirmation.create!(
      user:,
      office:,
      period_type: :week,
      starts_on: normalized_week_start,
      ends_on: normalized_week_end,
    )
  rescue ActiveRecord::RecordNotUnique
    raise AlreadyConfirmedError,
      "This attendance week has already been confirmed"
  end

  sig { returns(ActiveRecord::Relation) }
  def confirmed_visits
    Visit
      .where(
        user: user,
        office: office,
        visit_date: week_range
      )
      .order(:visit_date)
  end
end
