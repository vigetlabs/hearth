class Visit < ApplicationRecord
  belongs_to :office
  belongs_to :user

  enum :status, {
    planned: 0,
    confirmed: 1
  }

  validates :visit_date,
    presence: true,
    uniqueness: { scope: :user_id }
end
