# typed: true

module ApplicationCable
  class Connection
    sig { returns(User) }
    def current_user; end

    sig { params(current_user: User).returns(User) }
    def current_user=(current_user); end

    sig { returns(String) }
    def connection_id; end

    sig { params(connection_id: String).returns(String) }
    def connection_id=(connection_id); end
  end

  class Channel
    sig { returns(User) }
    def current_user; end

    sig { returns(String) }
    def connection_id; end
  end
end
