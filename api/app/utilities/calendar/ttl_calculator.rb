# typed: strict

module Calendar
  class TtlCalculator
    extend T::Sig
    extend ActiveSupport::Concern

    sig do
      params(
        stale_after: ActiveSupport::Duration
      ).returns(Float)
    end
    def self.expires_at(stale_after)
      stale_after.from_now.to_f
    end
  end
end
