require 'rails_helper'

RSpec.describe User, type: :model do
  subject(:user) do
    described_class.new(
      email: "user@example.com",
      first_name: "Ryan",
      last_name: "Dioneda",
      password: "password",
      password_confirmation: "password"
    )
  end

  it "is valid with correct fields" do
    expect(user).to be_valid
  end
end
