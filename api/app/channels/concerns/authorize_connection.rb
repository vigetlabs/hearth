module AuthorizeConnection
  extend ActiveSupport::Concern

  def allowed_to_view?(current_user)
    current_user.present?
  end
end
