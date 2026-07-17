class CreateOfficePresences < ActiveRecord::Migration[8.1]
  def change
    create_table :office_presences do |t|
      t.references :user,
        null: false,
        foreign_key: true

      t.references :office,
        null: false,
        foreign_key: true

      t.string :connection_id,
        null: false

      t.timestamps
    end

    add_index(
      :office_presences,
      %i[user_id office_id connection_id],
      unique: true,
      name: "index_office_presences_on_user_office_connection"
    )
  end
end
