class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, :omniauthable, jwt_revocation_strategy: self,
         omniauth_providers: [ :google_oauth2 ]

  has_many :user_identities, dependent: :destroy
  has_many :schedules, dependent: :destroy
  has_many :visits, dependent: :destroy
  has_many :attendance_confirmations, dependent: :destroy

  has_one :default_schedule,
    -> { where(is_default: true) },
    class_name: "Schedule"

  belongs_to :office, optional: true

  validates :first_name, presence: true
  validates :last_name, presence: true

  validates :office, presence: true, if: :office_id?
end
