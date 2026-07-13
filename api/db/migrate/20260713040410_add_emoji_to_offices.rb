class AddEmojiToOffices < ActiveRecord::Migration[8.1]
  def change
    add_column :offices, :emoji, :string, null: false
  end
end
