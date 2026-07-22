# typed: strict

module AuthorizeConnection
  extend T::Sig
  extend ActiveSupport::Concern

  sig { params(user: T.nilable(User)).returns(T::Boolean) }
  def allowed_to_view?(user)
    user.present?
  end
end
