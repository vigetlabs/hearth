class SlackSsoService
  def self.call(auth)
    new(auth).call
  end

  def initialize(auth)
    @auth = auth
  end

  attr_reader :auth

  def call
    slack_user_id = auth.uid
    slack_team_id = auth.extra.raw_info["https://slack.com/team_id"]

    identity = UserIdentity.find_by(
      provider: "slack",
      provider_uid: "#{slack_team_id}:#{slack_user_id}"
    )

    return identity.user if identity

    user = find_or_create_user
    
    UserIdentity.create!(
      user: user,
      provider: "slack",
      provider_uid: "#{slack_team_id}:#{slack_user_id}",
      email: auth.info.email,
      name: "#{@first_name} #{@last_name}"
    )

    user
  end

  private

  def find_or_create_user
    existing_user = User.find_by(email: auth.info.email)
    return existing_user if existing_user && email_verified?

    @first_name = auth.info.first_name.presence || name_parts.first || "Unknown"
    @last_name = auth.info.last_name.presence || name_parts[1..]&.join(" ").presence || "User"

    User.create!(
      email: auth.info.email,
      first_name: @first_name,
      last_name: @last_name,
      password: SecureRandom.hex(32)
    )
  end

  def name_parts
    return [] if auth.info.name.blank?

    return [] if auth.info.name.include?("@")

    auth.info.name.split
  end

  def email_verified?
    auth.extra.raw_info["email_verified"] == true
  end
end
