class OfficePresenceChannel < ApplicationCable::Channel
  include FindOffice
  include AuthorizeConnection

  def subscribed
    @office = find_office(params[:office_id])

    return reject unless @office && allowed_to_view?(current_user)

    stream_for @office

    presence_store.register(
      user_id: current_user.id,
      connection_id: connection_id
    )

    broadcast_active_office_presences
  end

  def unsubscribed
    return unless @office

    presence_store.remove(
      user_id: current_user.id,
      connection_id: connection_id
    )

    broadcast_active_office_presences
  end

  def heartbeat
    return unless @office

    presence_store.heartbeat(
      user_id: current_user.id,
      connection_id: connection_id
    )

    broadcast_active_office_presences
  end

  private

  def presence_store
    @presence_store ||= OfficePresenceStore.new(
      office_id: @office.id
    )
  end

  def broadcast_active_office_presences
    payload = {
      type: "presence.snapshot",
      office_id: @office.id,
      users: active_office_users
    }

    self.class.broadcast_to(
      @office,
      payload
    )
  end

  def active_office_users
    User
      .where(id: presence_store.active_user_ids)
      .includes(:default_schedule)
      .map do |user|
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          office_id: user.office_id,
          default_schedule: user.default_schedule
        }
      end
  end
end
