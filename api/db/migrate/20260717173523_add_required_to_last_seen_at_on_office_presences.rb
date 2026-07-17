class AddRequiredToLastSeenAtOnOfficePresences < ActiveRecord::Migration[8.1]
  def change
    change_column_null :office_presences, :last_seen_at, false
  end
end
