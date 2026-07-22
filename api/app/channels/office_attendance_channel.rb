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
end
