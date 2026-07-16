module Helpers
  module SerializeUserHelper
    extend ActiveSupport::Concern

    def serialize_user(user)
      UserSerializer
        .new(user)
        .serializable_hash[:data][:attributes]
    end

    def serialize_users(users)
      UserSerializer
        .new(users)
        .serializable_hash[:data]
        .map { |user| user[:attributes] }
    end
  end
end
