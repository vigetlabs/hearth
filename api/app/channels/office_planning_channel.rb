# typed: strict

class OfficePlanningChannel < ApplicationCable::Channel
  extend T::Sig

  include FindOffice
  include AuthorizeConnection

  OfficePlanningDates = T.type_alias do
      T::Hash[
        String,
        OfficePlanningBroadcaster::OfficePlanningOverrides
      ]
  end

  sig { void }
  def subscribed
    office = find_office(params[:office_id])
    return reject unless office
    @office = T.let(office, T.nilable(Office))
    return reject unless allowed_to_view?(current_user)

    stream_for @office
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def snapshot(data)
    dates = Calendar::DateUtility.validate_dates(data["dates"])

    transmit_snapshot(dates:)
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def select(data)
    date = Calendar::DateUtility.normalize_to_string(data["date"])
    return unless date

    planning_store.select(
      date:,
      user_id: current_user.id
    )

    broadcast_date_snapshot(date:)
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def heartbeat(data)
    selected_dates =
      Calendar::DateUtility.validate_dates(data["selected_dates"])

    deselected_dates =
      Calendar::DateUtility.validate_dates(data["deselected_dates"])

    planning_store.heartbeat(
      selected_dates:,
      deselected_dates:,
      user_id: current_user.id
    )
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def deselect(data)
    date = Calendar::DateUtility.normalize_to_string(data["date"])
    return unless date

    planning_store.deselect(
      date:,
      user_id: current_user.id
    )

    broadcast_date_snapshot(date:)
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def clear(data)
    dates = Calendar::DateUtility.validate_dates(data["dates"])

    planning_store.clear(
      dates:,
      user_id: current_user.id
    )

    dates.each do |date|
      broadcast_date_snapshot(date:)
    end
  end

  private

  sig { returns(Office) }
  def office
    T.must(@office)
  end

  sig { returns(OfficePlanningStore) }
  def planning_store
    @planning_store ||= T.let(
      OfficePlanningStore.new(office_id: office.id),
      T.nilable(OfficePlanningStore)
    )
  end

  sig { params(dates: T::Array[String]).void }
  def transmit_snapshot(dates:)
    dates_data = T.let(
      dates.to_h do |date|
        [
          date,
          OfficePlanningBroadcaster.overrides_for(
            office:,
            date:
          )
        ]
      end,
      OfficePlanningDates
    )

    transmit({
      type: "planning.snapshot",
      office_id: office.id,
      dates: dates_data
    })
  end

  sig { params(date: String).void }
  def broadcast_date_snapshot(date:)
    OfficePlanningBroadcaster.broadcast_date(
      office:,
      date:
    )
  end
end
