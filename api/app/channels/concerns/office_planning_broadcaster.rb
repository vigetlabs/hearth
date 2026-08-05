# typed: strict

class OfficePlanningBroadcaster
  extend T::Sig

  UserMap = T.type_alias do
    T::Hash[Integer, User]
  end

  ChannelSerializedSchedule = T.type_alias do
    {
      id: Integer,
      is_default: T::Boolean,
      monday: T::Boolean,
      tuesday: T::Boolean,
      wednesday: T::Boolean,
      thursday: T::Boolean,
      friday: T::Boolean,
      saturday: T::Boolean,
      sunday: T::Boolean,
    }
  end

  ChannelSerializedOffice = T.type_alias do
    {
      id: Integer,
      name: String
    }
  end

  ChannelSerializedUser = T.type_alias do
    {
      id: Integer,
      email: String,
      first_name: String,
      last_name: String,
      office: T.nilable(ChannelSerializedOffice),
      default_schedule: T.nilable(ChannelSerializedSchedule),
      is_onboarding_complete: T::Boolean
    }
  end

  OfficePlanningOverrides = T.type_alias do
    {
      selected: T::Array[ChannelSerializedUser],
      deselected: T::Array[ChannelSerializedUser]
    }
  end


  sig do
    params(
      office: Office,
      date: String
    ).returns(OfficePlanningOverrides)
  end
  def self.overrides_for(office:, date:)
    new(
      office:,
      date:
    ).overrides
  end

  sig do
    params(
      office: Office,
      date: String
    ).void
  end
  def self.broadcast_date(office:, date:)
    new(
      office:,
      date:
    ).broadcast
  end

  sig { params(office: Office).void }
  def self.broadcast_roster_update(office:)
    payload = {
      type: "planning.roster.updated",
      office_id: office.id
    }

    OfficePlanningChannel.broadcast_to(
      office,
      payload
    )
  end

  sig do
    params(
      office: Office,
      date: String
    ).void
  end
  def initialize(office:, date:)
    @office = T.let(office, Office)
    @date = T.let(date, String)

    @planning_store = T.let(
      OfficePlanningStore.new(
        office_id: office.id
      ),
      OfficePlanningStore
    )
  end

  sig { void }
  def broadcast
    payload = {
      type: "planning.date.updated",
      office_id: @office.id,
      date: @date,
      overrides:
    }

    OfficePlanningChannel.broadcast_to(
      @office,
      payload
    )
  end

  sig { returns(OfficePlanningOverrides) }
  def overrides
    selected_user_ids = T.let(
      @planning_store.selected_user_ids(date: @date),
      T::Array[Integer]
    )

    deselected_user_ids = T.let(
      @planning_store.deselected_user_ids(date: @date),
      T::Array[Integer]
    )

    all_users_by_id = selected_user_ids | deselected_user_ids
    users_by_id = load_users(all_users_by_id)

    {
      selected: serialize_users(
        selected_user_ids,
        users_by_id:
      ),
      deselected: serialize_users(
        deselected_user_ids,
        users_by_id:
      )
    }
  end

  private

  sig { params(user_ids: T::Array[Integer]).returns(UserMap) }
  def load_users(user_ids)
    User
      .includes(:office, :default_schedule)
      .where(id: user_ids)
      .index_by(&:id)
  end

  sig do
    params(
      user_ids: T::Array[Integer],
      users_by_id: UserMap
    ).returns(T::Array[ChannelSerializedUser])
  end
  def serialize_users(user_ids, users_by_id:)
    users = user_ids.filter_map do |user_id|
      users_by_id[user_id]
    end

    serialized_users = UserSerializer
      .new(users)
      .serializable_hash[:data]

    serialized_users.map do |serialized_user |
      T.cast(
        serialized_user[:attributes],
        ChannelSerializedUser
      )
    end
  end

  sig do
    params(
      user: User
    ).returns(T.nilable(ChannelSerializedOffice))
  end
  def serialize_office(user)
    office = user.office
    return unless office

    {
      id: office.id,
      name: office.name
    }
  end
end
