# typed: strict

class OfficePlanningChannel < ApplicationCable::Channel
  extend T::Sig

  include FindOffice
  include AuthorizeConnection

  UserMap = T.type_alias do
    T::Hash[Integer, User]
  end

  ChannelSerializedUser = T.type_alias do
    {
      id: Integer,
      first_name: String,
      last_name: String,
      office_id: T.nilable(Integer)
    }
  end

  OfficePlanningDates = T.type_alias do
    T::Hash[String, T::Array[ChannelSerializedUser]]
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
    dates = DateUtility.validate_dates(data["dates"])

    transmit_snapshot(dates:)
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def select(data)
    date = DateUtility.normalize_to_string(data["date"])
    return unless date

    planning_store.select(
      date:,
      user_id: current_user.id
    )

    broadcast_date_snapshot(date:)
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def heartbeat(data)
    dates = DateUtility.validate_dates(data["dates"])

    dates.each do |date|
      planning_store.heartbeat(
        date:,
        user_id: current_user.id
      )
    end
  end

  sig { params(data: ApplicationCable::Types::ChannelData).void }
  def deselect(data)
    date = DateUtility.normalize_to_string(data["date"])
    return unless date

    planning_store.deselect(
      date:,
      user_id: current_user.id
    )

    broadcast_date_snapshot(date:)
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
    selected_user_ids_by_date = T.let(
      dates.index_with do |date|
        planning_store.selected_user_ids(date:)
      end,
      T::Hash[String, T::Array[Integer]]
    )

    user_ids = T.let(
      selected_user_ids_by_date.values.flatten.uniq,
      T::Array[Integer]
    )

    users_by_id = T.let(
      load_users(user_ids),
      T::Hash[Integer, User]
    )

    dates_data = T.let(
      selected_user_ids_by_date.transform_values do |user_ids|
        serialize_users(user_ids, users_by_id:)
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
    user_ids = T.let(
      planning_store.selected_user_ids(date:),
      T::Array[Integer]
    )

    users_by_id = T.let(
      load_users(user_ids),
      T::Hash[Integer, User]
    )

    payload = {
      type: "planning.date.updated",
      office_id: office.id,
      date:,
      users: serialize_users(user_ids, users_by_id:)
    }

    self.class.broadcast_to(
      office,
      payload
    )
  end

  sig { params(user_ids: T::Array[Integer]).returns(UserMap) }
  def load_users(user_ids)
    User
      .where(id: user_ids)
      .select(:id, :first_name, :last_name, :office_id)
      .index_by(&:id)
  end

  sig do
    params(
      user_ids: T::Array[Integer],
      users_by_id: UserMap
    ).returns(T::Array[ChannelSerializedUser])
  end
  def serialize_users(user_ids, users_by_id:)
    user_ids.filter_map do |user_id|
      user = users_by_id[user_id]
      next unless user

      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        office_id: user.office_id
      }
    end
  end
end
