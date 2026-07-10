class Schedule < ApplicationRecord
  DAYS = %w[
    monday
    tuesday
    wednesday
    thursday
    friday
    saturday
    sunday
  ]

  belongs_to :user

  validates :is_default,
    inclusion: { in: [ true, false ] }

  DAYS.each do |day|
    validates day,
      inclusion: { in: [ true, false ] }
  end

  scope :default, -> { where(is_default: true) }
end
