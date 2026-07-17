require 'rails_helper'

RSpec.describe OfficePresence, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:office).optional }
    it { is_expected.to belong_to(:user) }
  end
end
