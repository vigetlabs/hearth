module Helpers
  module SerializeUserHelper
    extend ActiveSupport::Concern

    def serialize_user(user)
      UserSerializer
        .new(user)
        .serializable_hash[:data][:attributes]
    end
  end
end
