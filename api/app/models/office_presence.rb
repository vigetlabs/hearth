class OfficePresence < ApplicationRecord
  STALE_AFTER = 90.seconds

  belongs_to :user
  belongs_to :office, optional: true

  validates :connection_id, presence: true
  validates :last_seen_at, presence: true

  validates :connection_id,
    uniqueness: {
      scope: %i[user_id office_id]
    }

  scope :active, -> {
    where(last_seen_at: STALE_AFTER.ago..)
  }

  scope :stale, -> {
    where(last_seen_at: ...STALE_AFTER.ago)
  }
end
