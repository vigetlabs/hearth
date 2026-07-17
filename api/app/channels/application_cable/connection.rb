module ApplicationCable
  class Connection < ActionCable::Connection::Base
    include AuthenticateConnection

    identified_by :current_user, :connection_id

    def connect
      self.current_user = find_verified_user
      self.connection_id = SecureRandom.uuid
    end
  end
end
