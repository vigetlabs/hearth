offices = [
  {
    name: "Durham",
    city: "Durham",
    state: "NC",
    timezone: "America/New_York",
    emoji: "🐂"
  },
  {
    name: "Boulder",
    city: "Boulder",
    state: "CO",
    timezone: "America/Denver",
    emoji: "⛰️"
  },
  {
    name: "Falls Church",
    city: "Falls Church",
    state: "VA",
    timezone: "America/New_York",
    emoji: "🌸"
  },
  {
    name: "Chattanooga",
    city: "Chattanooga",
    state: "TN",
    timezone: "America/New_York",
    emoji: "🚂"
  },
  {
    name: "Remote",
    city: "Remote",
    state: "Remote",
    timezone: "Etc/UTC",
    emoji: "🏠"
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
