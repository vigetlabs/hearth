# typed: strict

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    extend T::Sig
    include AuthenticateConnection

    identified_by :current_user, :connection_id

    sig { void }
    def connect
      self.current_user = find_verified_user
      self.connection_id = SecureRandom.uuid
    end
  end
end
