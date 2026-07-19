class CreateAttendanceConfirmations < ActiveRecord::Migration[8.1]
  def change
    create_table :attendance_confirmations do |t|
      t.references :user,
        null: false,
        foreign_key: false

      t.references :office,
        null: false,
        foreign_key: true

      t.integer :period_type,
        null: false

      t.date :starts_on,
        null: false

      t.date :ends_on,
        null: false

      t.timestamps
    end

    add_index :attendance_confirmations,
      [
        :user_id,
        :office_id,
        :period_type,
        :starts_on
      ],
      unique: true,
      name: "index_attendance_confirmations_on_period"
  end
end
