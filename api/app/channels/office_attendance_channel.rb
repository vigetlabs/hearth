# typed: strict

class OfficeAttendanceChannel < ApplicationCable::Channel
  extend T::Sig

  include FindOffice
  include AuthorizeConnection

  EditingSnapshotPayload = T.type_alias do
    {
      type: String,
      office_id: Integer,
      week_start: String,
      editing_user_ids: T::Array[Integer]
    }
  end

  sig { void }
  def subscribed
    found_office = find_office(params[:office_id])
    return reject unless found_office

    @office = T.let(
      found_office,
      T.nilable(Office)
    )

    return reject unless allowed_to_view?(current_user)

    stream_for office
  end

  # Function only called in `confirm_week_service.rb` after
  # a week confirmation has succesfully been saved
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
  def snapshot(data)
    week_start = normalized_week_start_from(
      data
    )

    transmit_editing_snapshot(
      week_start: week_start.iso8601
    )
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def start_editing(data)
    week_start = normalized_week_start_from(
      data
    )

    normalized_week_start = week_start.iso8601

    week_dates = T.let(
      DateUtility.week_dates(
        week_start
      ),
      T::Array[String]
    )

    confirmed_dates = confirmed_visit_dates(
      week_dates:
    )

    office_attendance_editing_store.start_editing(
      week_start: normalized_week_start,
      user_id: current_user.id
    )

    initialize_planning_draft(
      week_dates:,
      confirmed_dates:
    )

    broadcast_planning_dates(
      dates: week_dates
    )

    broadcast_editing_snapshot(
      week_start: normalized_week_start
    )
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def stop_editing(data)
    week_start = normalized_week_start_from(
      data
    )

    normalized_week_start = week_start.iso8601

    week_dates = T.let(
      DateUtility.week_dates(
        week_start
      ),
      T::Array[String]
    )

    office_attendance_editing_store.stop_editing(
      week_start: normalized_week_start,
      user_id: current_user.id
    )

    planning_store.clear(
      dates: week_dates,
      user_id: current_user.id
    )

    broadcast_editing_snapshot(
      week_start: normalized_week_start
    )

    broadcast_planning_dates(
      dates: week_dates
    )
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def heartbeat(data)
    week_start = normalized_week_start_from(
      data
    )

    office_attendance_editing_store.heartbeat(
      week_start: week_start.iso8601,
      user_id: current_user.id
    )
  end

  private

  sig { returns(Office) }
  def office
    T.must(@office)
  end

  sig do
    params(
      data: ApplicationCable::Types::ChannelData
    ).returns(Date)
  end
  def normalized_week_start_from(data)
    T.let(
      DateUtility.normalized_week_start(
        data["week_start"]
      ),
      Date
    )
  end

  sig do
    params(
      week_dates: T::Array[String]
    ).returns(T::Set[String])
  end
  def confirmed_visit_dates(week_dates:)
    T.let(
      Visit
        .where(
          user: current_user,
          office:,
          status: :confirmed,
          visit_date: week_dates
        )
        .pluck(:visit_date)
        .map(&:iso8601)
        .to_set,
      T::Set[String]
    )
  end

  sig do
    params(
      week_dates: T::Array[String],
      confirmed_dates: T::Set[String]
    ).void
  end
  def initialize_planning_draft(
    week_dates:,
    confirmed_dates:
  )
    week_dates.each do |date|
      if confirmed_dates.include?(date)
        planning_store.select(
          date:,
          user_id: current_user.id
        )
      else
        planning_store.deselect(
          date:,
          user_id: current_user.id
        )
      end
    end
  end

  sig { params(dates: T::Array[String]).void }
  def broadcast_planning_dates(dates:)
    dates.each do |date|
      OfficePlanningBroadcaster.broadcast_date(
        office:,
        date:
      )
    end
  end

  sig { params(week_start: String).void }
  def transmit_editing_snapshot(week_start:)
    transmit(
      editing_snapshot_payload(
        week_start:
      )
    )
  end

  sig { params(week_start: String).void }
  def broadcast_editing_snapshot(week_start:)
    self.class.broadcast_to(
      office,
      editing_snapshot_payload(
        week_start:
      )
    )
  end

  sig do
    params(
      week_start: String
    ).returns(EditingSnapshotPayload)
  end
  def editing_snapshot_payload(week_start:)
    {
      type: "attendance.editing.updated",
      office_id: office.id,
      week_start:,
      editing_user_ids:
        office_attendance_editing_store.editing_user_ids(
          week_start:
        )
    }
  end

  sig { returns(OfficeAttendanceEditingStore) }
  def office_attendance_editing_store
    @office_attendance_editing_store ||= T.let(
      OfficeAttendanceEditingStore.new(
        office_id: office.id
      ),
      T.nilable(OfficeAttendanceEditingStore)
    )
  end

  sig { returns(OfficePlanningStore) }
  def planning_store
    @planning_store ||= T.let(
      OfficePlanningStore.new(
        office_id: office.id
      ),
      T.nilable(OfficePlanningStore)
    )
  end
end
