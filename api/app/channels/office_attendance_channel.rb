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
      DateUtility.normalize_week_start(data["week_start"]),
      Date
    )

    week_dates = T.let(
      DateUtility.week_dates(week_start),
      T::Array[String]
    )

    confirmed_dates = T.let(
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
  end
end
