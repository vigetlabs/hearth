class CreateSchedules < ActiveRecord::Migration[8.1]
  def change
    create_table :schedules do |t|
      t.references :user,
        null: false,
        foreign_key: true

      t.boolean :is_default,
        null: false,
        default: true

      t.boolean :monday,
        null: false,
        default: false

      t.boolean :tuesday,
        null: false,
        default: false

      t.boolean :wednesday,
        null: false,
        default: false

      t.boolean :thursday,
        null: false,
        default: false

      t.boolean :friday,
        null: false,
        default: false

      t.boolean :saturday,
        null: false,
        default: false

      t.boolean :sunday,
        null: false,
        default: false

      t.timestamps
    end

    add_index :schedules,
      :user_id,
      unique: true,
      where: "is_default = true",
      name: "index_schedules_on_unique_default_per_user"
  end
end
