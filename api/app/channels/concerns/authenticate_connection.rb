# typed: strict

#
module AuthenticateConnection
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  requires_ancestor { ActionCable::Connection::Base }

  sig { returns(User) }
  def find_verified_user
    connection = T.unsafe(self)

    verified_user =
      connection.env["warden"].authenticate(scope: :user)

    return T.cast(verified_user, User) if verified_user

    connection.reject_unauthorized_connection
    Kernel.raise "Unreachable"
  end
end
