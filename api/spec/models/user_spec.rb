require 'rails_helper'

RSpec.describe User, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:office).optional }
    it { is_expected.to have_many(:user_identities) }
    it { is_expected.to have_many(:schedules) }
  end

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

  it "is invalid without an email" do
    user.email = nil
    expect(user).not_to be_valid
  end

  it "is invalid without a first name" do
    user.first_name = nil
    expect(user).not_to be_valid
  end

  it "is invalid without a last name" do
    user.last_name = nil
    expect(user).not_to be_valid
  end

  it "is invalid without a password" do
    user.password = nil
    expect(user).not_to be_valid
  end

  it "is invalid with an empty string as password" do
    user.password = ""
    expect(user).not_to be_valid
  end

  it "is invalid with an empty string as first name" do
    user.first_name = ""
    expect(user).not_to be_valid
  end

  it "is invalid with an empty string as last name" do
    user.last_name = ""
    expect(user).not_to be_valid
  end

  it "is invalid with a duplicate email" do
    described_class.create!(
      email: "user@example.com",
      first_name: "Sam",
      last_name: "Brothers",
      password: "diffpassword",
      password_confirmation: "diffpassword"
    )
    expect(user).not_to be_valid
  end

  it "stores correct hash of password" do
    expect(user.valid_password?("password")).to be true
    expect(user.valid_password?("not_password")).to be false
  end
end
