class CreateOffices < ActiveRecord::Migration[8.1]
  def change
    create_table :offices do |t|
      t.string :name, null: false
      t.string :timezone, null: false
      t.string :state, null: false
      t.string :city, null: false

      t.timestamps
    end

    add_index :offices,
      "LOWER(name), LOWER(city), LOWER(state)",
      unique: true,
      name: "index_offices_on_lower_name_city_state"
  end
end
