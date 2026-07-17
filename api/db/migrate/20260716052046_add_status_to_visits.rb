class AddStatusToVisits < ActiveRecord::Migration[8.1]
  def change
    add_column :visits, :status, :integer, null: false, default: 0
  end
end
