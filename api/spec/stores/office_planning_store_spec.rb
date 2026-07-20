require "rails_helper"

RSpec.describe OfficePlanningStore do
  describe "#clear" do
    subject(:clear) do
      described_class
        .new(office_id:)
        .clear(dates:, user_id:)
    end

    let(:office_id) { 42 }
    let(:user_id) { 7 }
    let(:dates) { [ "2026-07-13", "2026-07-15" ] }
    let(:redis) { double("Redis") }
    let(:transaction) { double("Redis transaction") }
    let(:key_prefix) do
      "#{ApplicationRedis::PREFIX}:office-planning:office:#{office_id}:date"
    end

    before do
      allow(ApplicationRedis).to receive(:with).and_yield(redis)
      allow(redis).to receive(:multi).and_yield(transaction)
    end

    it "removes the user from both planning states for every date" do
      dates.each do |date|
        expect(transaction)
          .to receive(:zrem)
          .with("#{key_prefix}:#{date}:selected", user_id)
          .ordered

        expect(transaction)
          .to receive(:zrem)
          .with("#{key_prefix}:#{date}:deselected", user_id)
          .ordered
      end

      clear
    end
  end
end
