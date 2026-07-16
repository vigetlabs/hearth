# AI generated seed data for better examples
# db/seeds.rb

puts "Seeding offices..."

office_attributes = [
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

offices = office_attributes.to_h do |attributes|
  normalized_name = attributes.fetch(:name).downcase

  office = Office.find_or_initialize_by(name: normalized_name)
  office.update!(attributes)

  [ normalized_name, office ]
end

puts "Seeded #{offices.size} offices."

puts "Seeding users..."

seed_users = [
  # Boulder
  {
    email: "jane.doe@viget.com",
    first_name: "Jane",
    last_name: "Doe",
    office_name: "boulder"
  },
  {
    email: "bob.hughes@viget.com",
    first_name: "Bob",
    last_name: "Hughes",
    office_name: "boulder"
  },
  {
    email: "alex.morgan@viget.com",
    first_name: "Alex",
    last_name: "Morgan",
    office_name: "boulder"
  },
  {
    email: "maya.patel@viget.com",
    first_name: "Maya",
    last_name: "Patel",
    office_name: "boulder"
  },
  {
    email: "noah.bennett@viget.com",
    first_name: "Noah",
    last_name: "Bennett",
    office_name: "boulder"
  },

  # Durham
  {
    email: "chris.johnson@viget.com",
    first_name: "Chris",
    last_name: "Johnson",
    office_name: "durham"
  },
  {
    email: "jordan.lee@viget.com",
    first_name: "Jordan",
    last_name: "Lee",
    office_name: "durham"
  },
  {
    email: "avery.clark@viget.com",
    first_name: "Avery",
    last_name: "Clark",
    office_name: "durham"
  },
  {
    email: "devon.harris@viget.com",
    first_name: "Devon",
    last_name: "Harris",
    office_name: "durham"
  },
  {
    email: "lena.foster@viget.com",
    first_name: "Lena",
    last_name: "Foster",
    office_name: "durham"
  },

  # Falls Church
  {
    email: "sam.rivera@viget.com",
    first_name: "Sam",
    last_name: "Rivera",
    office_name: "falls church"
  },
  {
    email: "taylor.kim@viget.com",
    first_name: "Taylor",
    last_name: "Kim",
    office_name: "falls church"
  },
  {
    email: "priya.shah@viget.com",
    first_name: "Priya",
    last_name: "Shah",
    office_name: "falls church"
  },
  {
    email: "marcus.green@viget.com",
    first_name: "Marcus",
    last_name: "Green",
    office_name: "falls church"
  },
  {
    email: "sophie.turner@viget.com",
    first_name: "Sophie",
    last_name: "Turner",
    office_name: "falls church"
  },

  # Chattanooga
  {
    email: "casey.williams@viget.com",
    first_name: "Casey",
    last_name: "Williams",
    office_name: "chattanooga"
  },
  {
    email: "riley.nguyen@viget.com",
    first_name: "Riley",
    last_name: "Nguyen",
    office_name: "chattanooga"
  },
  {
    email: "eli.carter@viget.com",
    first_name: "Eli",
    last_name: "Carter",
    office_name: "chattanooga"
  },
  {
    email: "zoe.mitchell@viget.com",
    first_name: "Zoe",
    last_name: "Mitchell",
    office_name: "chattanooga"
  },
  {
    email: "owen.brooks@viget.com",
    first_name: "Owen",
    last_name: "Brooks",
    office_name: "chattanooga"
  },

  # Remote
  {
    email: "jamie.brown@viget.com",
    first_name: "Jamie",
    last_name: "Brown",
    office_name: "remote"
  },
  {
    email: "morgan.davis@viget.com",
    first_name: "Morgan",
    last_name: "Davis",
    office_name: "remote"
  },
  {
    email: "cameron.wilson@viget.com",
    first_name: "Cameron",
    last_name: "Wilson",
    office_name: "remote"
  },
  {
    email: "drew.anderson@viget.com",
    first_name: "Drew",
    last_name: "Anderson",
    office_name: "remote"
  },
  {
    email: "harper.thomas@viget.com",
    first_name: "Harper",
    last_name: "Thomas",
    office_name: "remote"
  }
]

users = seed_users.to_h do |attributes|
  email = attributes.fetch(:email)
  office_name = attributes.fetch(:office_name)

  user = User.find_or_initialize_by(email: email)

  user.assign_attributes(
    first_name: attributes.fetch(:first_name),
    last_name: attributes.fetch(:last_name),
    office: offices.fetch(office_name)
  )

  if user.new_record?
    user.password = "password"
    user.password_confirmation = "password"
  end

  user.save!

  [ email, user ]
end

puts "Seeded #{users.size} users."

puts "Seeding visits..."

# A fixed seed makes the generated visit data identical each time the seeds run.
random = Random.new(20_260_716)

physical_office_names = %w[
  boulder
  durham
  falls\ church
  chattanooga
].freeze

users_by_home_office = users.values.group_by do |user|
  user.office.name
end

visit_start_date = Date.new(2026, 5, 4)
visit_end_date = Date.new(2026, 9, 25)

# Normal attendance probabilities for employees assigned to each physical
# office. These probabilities intentionally produce uneven weeks rather than
# placing everybody in the office on the same days.
#
# Date#wday:
#   0 = Sunday
#   1 = Monday
#   2 = Tuesday
#   3 = Wednesday
#   4 = Thursday
#   5 = Friday
#   6 = Saturday
attendance_probability_by_office = {
  "boulder" => {
    1 => 0.38,
    2 => 0.56,
    3 => 0.78,
    4 => 0.64,
    5 => 0.28
  },
  "durham" => {
    1 => 0.52,
    2 => 0.68,
    3 => 0.72,
    4 => 0.54,
    5 => 0.24
  },
  "falls church" => {
    1 => 0.32,
    2 => 0.62,
    3 => 0.84,
    4 => 0.68,
    5 => 0.22
  },
  "chattanooga" => {
    1 => 0.46,
    2 => 0.52,
    3 => 0.74,
    4 => 0.58,
    5 => 0.34
  }
}.freeze

# These are the rare dates on which most people assigned to every physical
# office attend. They can represent all-hands meetings, workshops, or major
# project events.
company_busy_days = [
  Date.new(2026, 6, 17),
  Date.new(2026, 8, 12)
].freeze

# These are intentionally low-attendance dates. Because the application stores
# positive visit records rather than absence records, a quiet date is represented
# by creating very few visits.
company_quiet_days = [
  Date.new(2026, 7, 3),
  Date.new(2026, 9, 4)
].freeze

# Office-specific events make one location especially busy without making every
# other location busy at the same time.
office_event_days = {
  Date.new(2026, 5, 20) => "durham",
  Date.new(2026, 6, 9) => "chattanooga",
  Date.new(2026, 7, 15) => "boulder",
  Date.new(2026, 8, 25) => "falls church",
  Date.new(2026, 9, 16) => "boulder"
}.freeze

# Office-specific quiet days represent events such as off-sites, local holidays,
# office maintenance, or teams choosing to work remotely.
office_quiet_days = {
  Date.new(2026, 5, 29) => "falls church",
  Date.new(2026, 6, 26) => "boulder",
  Date.new(2026, 7, 24) => "durham",
  Date.new(2026, 8, 7) => "chattanooga"
}.freeze

def weekday?(date)
  (1..5).cover?(date.wday)
end

def create_or_update_visit!(
  user:,
  office:,
  visit_date:,
  status:
)
  visit = Visit.find_or_initialize_by(
    user: user,
    visit_date: visit_date
  )

  visit.update!(
    office: office,
    status: status
  )
end

def visit_status_for(date:, random:)
  # Past visits are overwhelmingly confirmed. Future visits are more likely to
  # remain planned. This gives the calendar useful examples of both statuses.
  if date < Date.current
    random.rand < 0.94 ? :confirmed : :planned
  else
    random.rand < 0.58 ? :confirmed : :planned
  end
end

(visit_start_date..visit_end_date).each do |date|
  next unless weekday?(date)

  physical_office_names.each do |office_name|
    office = offices.fetch(office_name)
    office_users = users_by_home_office.fetch(office_name, [])

    attendance_probability =
      if company_busy_days.include?(date)
        0.92
      elsif company_quiet_days.include?(date)
        0.06
      elsif office_event_days[date] == office_name
        0.94
      elsif office_quiet_days[date] == office_name
        0.04
      else
        attendance_probability_by_office
          .fetch(office_name)
          .fetch(date.wday)
      end

    office_users.each do |user|
      next unless random.rand < attendance_probability

      create_or_update_visit!(
        user: user,
        office: office,
        visit_date: date,
        status: visit_status_for(date: date, random: random)
      )
    end
  end
end

puts "Seeding cross-office travel..."

cross_office_visits = [
  # Boulder visitors
  {
    user_email: "sam.rivera@viget.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 5, 13),
    status: :confirmed
  },
  {
    user_email: "chris.johnson@viget.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 6, 10),
    status: :confirmed
  },
  {
    user_email: "riley.nguyen@viget.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 15),
    status: :confirmed
  },
  {
    user_email: "priya.shah@viget.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 9, 16),
    status: :planned
  },

  # Durham visitors
  {
    user_email: "jane.doe@viget.com",
    office_name: "durham",
    visit_date: Date.new(2026, 5, 20),
    status: :confirmed
  },
  {
    user_email: "casey.williams@viget.com",
    office_name: "durham",
    visit_date: Date.new(2026, 6, 23),
    status: :confirmed
  },
  {
    user_email: "taylor.kim@viget.com",
    office_name: "durham",
    visit_date: Date.new(2026, 8, 19),
    status: :planned
  },

  # Falls Church visitors
  {
    user_email: "alex.morgan@viget.com",
    office_name: "falls church",
    visit_date: Date.new(2026, 5, 12),
    status: :confirmed
  },
  {
    user_email: "avery.clark@viget.com",
    office_name: "falls church",
    visit_date: Date.new(2026, 7, 8),
    status: :confirmed
  },
  {
    user_email: "zoe.mitchell@viget.com",
    office_name: "falls church",
    visit_date: Date.new(2026, 8, 25),
    status: :planned
  },

  # Chattanooga visitors
  {
    user_email: "maya.patel@viget.com",
    office_name: "chattanooga",
    visit_date: Date.new(2026, 6, 9),
    status: :confirmed
  },
  {
    user_email: "jordan.lee@viget.com",
    office_name: "chattanooga",
    visit_date: Date.new(2026, 7, 21),
    status: :confirmed
  },
  {
    user_email: "marcus.green@viget.com",
    office_name: "chattanooga",
    visit_date: Date.new(2026, 9, 9),
    status: :planned
  }
]

cross_office_visits.each do |attributes|
  create_or_update_visit!(
    user: users.fetch(attributes.fetch(:user_email)),
    office: offices.fetch(attributes.fetch(:office_name)),
    visit_date: attributes.fetch(:visit_date),
    status: attributes.fetch(:status)
  )
end

puts "Seeding remote employee visits..."

remote_employee_visits = [
  {
    user_email: "jamie.brown@viget.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 5, 20),
    status: :confirmed
  },
  {
    user_email: "jamie.brown@viget.com",
    office_name: "durham",
    visit_date: Date.new(2026, 8, 12),
    status: :planned
  },
  {
    user_email: "morgan.davis@viget.com",
    office_name: "falls church",
    visit_date: Date.new(2026, 6, 17),
    status: :confirmed
  },
  {
    user_email: "morgan.davis@viget.com",
    office_name: "chattanooga",
    visit_date: Date.new(2026, 9, 9),
    status: :planned
  },
  {
    user_email: "cameron.wilson@viget.com",
    office_name: "durham",
    visit_date: Date.new(2026, 5, 20),
    status: :confirmed
  },
  {
    user_email: "cameron.wilson@viget.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 15),
    status: :confirmed
  },
  {
    user_email: "drew.anderson@viget.com",
    office_name: "chattanooga",
    visit_date: Date.new(2026, 6, 9),
    status: :confirmed
  },
  {
    user_email: "drew.anderson@viget.com",
    office_name: "falls church",
    visit_date: Date.new(2026, 8, 25),
    status: :planned
  },
  {
    user_email: "harper.thomas@viget.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 6, 17),
    status: :confirmed
  },
  {
    user_email: "harper.thomas@viget.com",
    office_name: "falls church",
    visit_date: Date.new(2026, 9, 22),
    status: :planned
  }
]

remote_employee_visits.each do |attributes|
  create_or_update_visit!(
    user: users.fetch(attributes.fetch(:user_email)),
    office: offices.fetch(attributes.fetch(:office_name)),
    visit_date: attributes.fetch(:visit_date),
    status: attributes.fetch(:status)
  )
end

puts "Seed complete."
puts "  Offices: #{Office.count}"
puts "  Users:   #{User.count}"
puts "  Visits:  #{Visit.count}"
