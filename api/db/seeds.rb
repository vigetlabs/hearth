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

seed_users = [
  {
    email: "jane@example.com",
    first_name: "Jane",
    last_name: "Doe",
    office_name: "boulder"
  },
  {
    email: "bob@example.com",
    first_name: "Bob",
    last_name: "Doe",
    office_name: "boulder"
  },
  {
    email: "alex@example.com",
    first_name: "Alex",
    last_name: "Morgan",
    office_name: "boulder"
  },
  {
    email: "maya@example.com",
    first_name: "Maya",
    last_name: "Patel",
    office_name: "boulder"
  },
  {
    email: "sam@example.com",
    first_name: "Sam",
    last_name: "Rivera",
    office_name: "falls church"
  },
  {
    email: "taylor@example.com",
    first_name: "Taylor",
    last_name: "Kim",
    office_name: "falls church"
  },
  {
    email: "chris@example.com",
    first_name: "Chris",
    last_name: "Johnson",
    office_name: "durham"
  },
  {
    email: "jordan@example.com",
    first_name: "Jordan",
    last_name: "Lee",
    office_name: "durham"
  },
  {
    email: "casey@example.com",
    first_name: "Casey",
    last_name: "Williams",
    office_name: "chattanooga"
  },
  {
    email: "riley@example.com",
    first_name: "Riley",
    last_name: "Nguyen",
    office_name: "chattanooga"
  },
  {
    email: "jamie@example.com",
    first_name: "Jamie",
    last_name: "Brown",
    office_name: "remote"
  },
  {
    email: "morgan@example.com",
    first_name: "Morgan",
    last_name: "Davis",
    office_name: "remote"
  }
]

users = seed_users.to_h do |attributes|
  user = User.find_or_initialize_by(email: attributes[:email])

  user.assign_attributes(
    first_name: attributes[:first_name],
    last_name: attributes[:last_name],
    office: Office.find_by!(name: attributes[:office_name])
  )

  if user.new_record?
    user.password = "password"
    user.password_confirmation = "password"
  end

  user.save!

  [ user.email, user ]
end

visits = [
  # Monday, July 13
  {
    user_email: "jane@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 13)
  },
  {
    user_email: "bob@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 13)
  },
  {
    user_email: "chris@example.com",
    office_name: "durham",
    visit_date: Date.new(2026, 7, 13)
  },
  {
    user_email: "casey@example.com",
    office_name: "chattanooga",
    visit_date: Date.new(2026, 7, 13)
  },

  # Tuesday, July 14
  {
    user_email: "alex@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 14)
  },
  {
    user_email: "maya@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 14)
  },
  {
    user_email: "sam@example.com",
    office_name: "falls church",
    visit_date: Date.new(2026, 7, 14)
  },
  {
    user_email: "jordan@example.com",
    office_name: "durham",
    visit_date: Date.new(2026, 7, 14)
  },

  # Wednesday, July 15
  {
    user_email: "jane@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 15)
  },
  {
    user_email: "bob@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 15)
  },
  {
    user_email: "alex@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 15)
  },
  {
    user_email: "maya@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 15)
  },
  {
    user_email: "sam@example.com",
    office_name: "falls church",
    visit_date: Date.new(2026, 7, 15)
  },
  {
    user_email: "taylor@example.com",
    office_name: "falls church",
    visit_date: Date.new(2026, 7, 15)
  },
  {
    user_email: "chris@example.com",
    office_name: "durham",
    visit_date: Date.new(2026, 7, 15)
  },
  {
    user_email: "riley@example.com",
    office_name: "chattanooga",
    visit_date: Date.new(2026, 7, 15)
  },

  # Thursday, July 16
  {
    user_email: "jane@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 16)
  },
  {
    user_email: "maya@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 16)
  },
  {
    user_email: "taylor@example.com",
    office_name: "falls church",
    visit_date: Date.new(2026, 7, 16)
  },
  {
    user_email: "jordan@example.com",
    office_name: "durham",
    visit_date: Date.new(2026, 7, 16)
  },
  {
    user_email: "casey@example.com",
    office_name: "chattanooga",
    visit_date: Date.new(2026, 7, 16)
  },

  # Friday, July 17
  {
    user_email: "bob@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 17)
  },
  {
    user_email: "alex@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 17)
  },
  {
    user_email: "sam@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 17)
  },
  {
    user_email: "chris@example.com",
    office_name: "durham",
    visit_date: Date.new(2026, 7, 17)
  },
  {
    user_email: "riley@example.com",
    office_name: "chattanooga",
    visit_date: Date.new(2026, 7, 17)
  },

  # Remote users occasionally visiting physical offices
  {
    user_email: "jamie@example.com",
    office_name: "boulder",
    visit_date: Date.new(2026, 7, 15)
  },
  {
    user_email: "morgan@example.com",
    office_name: "falls church",
    visit_date: Date.new(2026, 7, 16)
  }
]

visits.each do |attributes|
  visit = Visit.find_or_initialize_by(
    user: users.fetch(attributes[:user_email]),
    visit_date: attributes[:visit_date]
  )

  visit.update!(
    office: Office.find_by!(name: attributes[:office_name])
  )
end
