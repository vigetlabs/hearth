class RemoveStatusColumnFromVisitTable < ActiveRecord::Migration[8.1]
  def change
    remove_column :visits, :status, :integer
  end
end
