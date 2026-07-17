class RemoveOfficeOptionalOnOfficePresences < ActiveRecord::Migration[8.1]
  def change
    change_column_null :office_presences, :office_id, false
  end
end
