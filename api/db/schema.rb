# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_07_17_173523) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "office_presences", force: :cascade do |t|
    t.string "connection_id", null: false
    t.datetime "created_at", null: false
    t.datetime "last_seen_at", null: false
    t.bigint "office_id"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["office_id"], name: "index_office_presences_on_office_id"
    t.index ["user_id", "office_id", "connection_id"], name: "index_office_presences_on_user_office_connection", unique: true
    t.index ["user_id"], name: "index_office_presences_on_user_id"
  end

  create_table "offices", force: :cascade do |t|
    t.string "city", null: false
    t.datetime "created_at", null: false
    t.string "emoji", null: false
    t.string "name", null: false
    t.string "state", null: false
    t.string "timezone", null: false
    t.datetime "updated_at", null: false
    t.index "lower((name)::text), lower((city)::text), lower((state)::text)", name: "index_offices_on_lower_name_city_state", unique: true
  end

  create_table "schedules", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "friday", default: false, null: false
    t.boolean "is_default", default: true, null: false
    t.boolean "monday", default: false, null: false
    t.boolean "saturday", default: false, null: false
    t.boolean "sunday", default: false, null: false
    t.boolean "thursday", default: false, null: false
    t.boolean "tuesday", default: false, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.boolean "wednesday", default: false, null: false
    t.index ["user_id"], name: "index_schedules_on_unique_default_per_user", unique: true, where: "(is_default = true)"
    t.index ["user_id"], name: "index_schedules_on_user_id"
  end

  create_table "user_identities", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email"
    t.string "name"
    t.string "provider", null: false
    t.string "provider_uid", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["provider", "provider_uid"], name: "index_user_identities_on_provider_and_provider_uid", unique: true
    t.index ["user_id"], name: "index_user_identities_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "first_name", null: false
    t.string "jti", null: false
    t.string "last_name", null: false
    t.bigint "office_id"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["office_id"], name: "index_users_on_office_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "visits", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "office_id", null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.date "visit_date"
    t.index ["office_id"], name: "index_visits_on_office_id"
    t.index ["user_id", "visit_date"], name: "index_visits_on_user_id_and_visit_date", unique: true
    t.index ["user_id"], name: "index_visits_on_user_id"
  end

  add_foreign_key "office_presences", "offices"
  add_foreign_key "office_presences", "users"
  add_foreign_key "schedules", "users"
  add_foreign_key "user_identities", "users"
  add_foreign_key "users", "offices"
  add_foreign_key "visits", "offices"
  add_foreign_key "visits", "users"
end
