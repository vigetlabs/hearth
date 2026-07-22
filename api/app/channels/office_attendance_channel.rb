# typed: strict

class OfficeAttendanceChannel < ApplicationCable::Channel
  extend T::Sig

  include FindOffice
  include AuthorizeConnection

  sig { void }
  def subscribed
    office = find_office(params[:office_id])
    return reject unless office
    @office = T.let(office, T.nilable(Office))
    return reject unless allowed_to_view?(current_user)

    stream_for @office
  end

  # Function only called in `confirm_week_service.rb`
  sig do
    params(
      office: Office,
      confirmation: AttendanceConfirmation
    ).void
  end
  def self.broadcast_attendance_confirmation(
    office:,
    confirmation:
  )
    payload = {
      type: "attendance.week.confirmed",
      office_id: office.id,
      starts_on: confirmation.starts_on.iso8601
    }

    broadcast_to(
      office,
      payload
    )
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def start_editing(data)
    week_start = T.let(
      DateUtility.normalized_week_start(data["week_start"]),
      Date
    )

    week_dates = T.let(
      DateUtility.week_dates(week_start),
      T::Array[String]
    )

    confirmed_visits = T.let(
      Visit
        .where(
          user: current_user,
          office: @office,
          visit_date: week_dates
        )
        .pluck(:visit_date)
        .map(&:iso8601)
        .to_set,
      T::Set[String]
    )

    normalized_week_start = DateUtility.normalize_to_string(week_start)
    raise ArgumentError, "Invalid week start" if normalized_week_start.nil?

    office_attendance_editing_store.start_editing(
      week_start: normalized_week_start,
      user_id: current_user.id
    )

    week_dates.each do |date|
      if confirmed_visits.include?(date)
        planning_store.select(date:, user_id: current_user.id)
      else
        planning_store.deselect(date:, user_id: current_user.id)
      end
    end
  end

  sig { returns(OfficeAttendanceEditingStore) }
  def office_attendance_editing_store
    @office_attendance_editing_store ||= T.let(
      OfficeAttendanceEditingStore.new(office_id: T.must(@office).id),
      T.nilable(OfficeAttendanceEditingStore)
    )
  end

  sig { returns(OfficePlanningStore) }
  def planning_store
    @planning_store ||= T.let(
      OfficePlanningStore.new(office_id: T.must(@office).id),
      T.nilable(OfficePlanningStore)
    )
  end
end
