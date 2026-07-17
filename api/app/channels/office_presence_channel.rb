class OfficePresenceChannel < ApplicationCable::Channel
  def subscribed
    @office = Office.find(params[:office_id])

    return reject unless @office
    return reject unless allowed_to_view?

    stream_for @office

    register_office_presence
    remove_stale_presences

    broadcast_active_office_presences
  end

  def unsubscribed
    current_presence&.destroy
    broadcast_active_office_presences if @office
  end

  # periodic heartbeat function called by client to keep
  # connection alive and prevent it being labeled as stale
  def heartbeat
    return unless @office

    current_presence&.touch(:last_seen_at)

    remove_stale_presences
    broadcast_active_office_presences
  end

  private

  def find_office
    Office.find(params[:office_id])
  rescue KeyError, ActiveRecord::RecordNotFound
    nil
  end

  def allowed_to_view?
    current_user.present?
  end

  def register_office_presence
    now = Time.current

    OfficePresence.upsert(
      {
        user_id: current_user.id,
        office_id: @office.id,
        connection_id: connection_id,
        last_seen_at: now,
        created_at: now,
        updated_at: now
      },
      unique_by: :index_office_presences_on_user_office_connection
    )
  end

  def current_presence
    return unless @office

    OfficePresence.find_by(
      user_id: current_user.id,
      office_id: @office.id,
      connection_id: connection_id
    )
  end

  def remove_stale_presences
    OfficePresence
      .where(office_id: @office.id)
      .stale
      .delete_all
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
    OfficePresence
      .where(office_id: @office.id)
      .active
      .includes(:user)
      .map(&:user)
      .uniq(&:id)
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
