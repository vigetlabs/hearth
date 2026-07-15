class CreateVisits < ActiveRecord::Migration[8.1]
  def change
    create_table :visits do |t|
      t.date :visit_date
      t.references :office, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :visits, [ :user_id, :visit_date ], unique: true
  end
end
