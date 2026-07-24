class AddIsOnboardingCompleteFlagToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :is_onboarding_complete, :boolean, default: false, null: false
  end
end
