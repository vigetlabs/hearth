class Office < ApplicationRecord
  before_validation :normalize_location_fields

  validates :name,
    presence: true,
    uniqueness: {
      scope: [ :city, :state ],
      case_sensitive: false
    }

  validates :timezone,
    presence: true,
    inclusion: {
      in: ActiveSupport::TimeZone.all.map(&:tzinfo).map(&:name)
    }

  validates :state, presence: true
  validates :city, presence: true
  validates :emoji, presence: true

  has_many :users
  has_many :visits, dependent: :destroy
  has_many :office_presences, dependent: :destroy

  def normalize_location_fields
    self.name = name&.squish&.downcase
    self.city = city&.squish&.downcase
    self.state = state&.squish&.downcase
  end
end
