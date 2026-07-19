class Visit < ApplicationRecord
  belongs_to :office
  belongs_to :user

  validates :visit_date,
    presence: true,
    uniqueness: { scope: :user_id }
end
