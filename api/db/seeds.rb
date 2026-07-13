# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
offices = [
  {
    name: "Durham",
    city: "Durham",
    state: "NC",
    timezone: "America/New_York"
  },
  {
    name: "Boulder",
    city: "Boulder",
    state: "CO",
    timezone: "America/Denver"
  },
  {
    name: "Falls Church",
    city: "Falls Church",
    state: "VA",
    timezone: "America/New_York"
  },
  {
    name: "Chattanooga",
    city: "Chattanooga",
    state: "TN",
    timezone: "America/New_York"
  },
  {
    name: "Remote",
    city: "Remote",
    state: "Remote",
    timezone: "Etc/UTC"
  }
]

offices.each do |attributes|
  office = Office.find_or_initialize_by(
    name: attributes[:name].downcase,
    city: attributes[:city].downcase,
    state: attributes[:state].downcase
  )

  office.update!(attributes)
end
