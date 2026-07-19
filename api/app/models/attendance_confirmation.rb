# typed: strict

class AttendanceConfirmation < ApplicationRecord
  extend T::Sig

  belongs_to :user
  belongs_to :office

  enum :period_type, {
    week: 0
  }

  before_validation :normalize_period

  validates :period_type, presence: true
  validates :starts_on, presence: true
  validates :ends_on, presence: true

  validates :user_id,
    uniqueness: {
      scope: [
        :office_id,
        :period_type,
        :starts_on
      ]
    }

  validate :ends_on_is_not_before_starts_on

  sig { params(date: Date).returns(ActiveRecord::Relation) }
  def self.covering(date)
    where("starts_on <= ? AND ends_on >= ?", date, date)
  end

  sig { params(date: Date).returns(T::Boolean) }
  def covers?(date)
    starts_on <= date && date <= ends_on
  end

  private

  sig { void }
  def normalize_period
    cur_starts_on =
      T.let(T.unsafe(starts_on), T.nilable(Date))

    cur_period_type =
      T.let(T.unsafe(period_type), T.nilable(String))

    return unless cur_starts_on
    return unless cur_period_type

    case period_type
    when "week"
      self.starts_on = starts_on.beginning_of_week(:monday)
      self.ends_on = self.starts_on + 4.days
    end
  end

  sig { void }
  def ends_on_is_not_before_starts_on
    cur_starts_on =
      T.let(T.unsafe(starts_on), T.nilable(Date))

    cur_period_type =
      T.let(T.unsafe(period_type), T.nilable(String))

    return unless cur_starts_on
    return unless cur_period_type
    return if ends_on >= starts_on

    errors.add(
      :ends_on,
      "must be on or after starts_on"
    )
  end
end
