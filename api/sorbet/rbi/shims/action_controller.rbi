# typed: true

class ApplicationController
  extend T::Sig

  sig { returns(T.nilable(User)) }
  def current_user; end

  sig { void }
  def authenticate_user!; end
end
