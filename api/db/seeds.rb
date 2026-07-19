# # AI GENERATED
# # puts "Seeding offices..."
# #
# office_attributes = [
#   {
#     name: "Durham",
#     city: "Durham",
#     state: "NC",
#     timezone: "America/New_York",
#     emoji: "🐂"
#   },
#   {
#     name: "Boulder",
#     city: "Boulder",
#     state: "CO",
#     timezone: "America/Denver",
#     emoji: "⛰️"
#   },
#   {
#     name: "Falls Church",
#     city: "Falls Church",
#     state: "VA",
#     timezone: "America/New_York",
#     emoji: "🌸"
#   },
#   {
#     name: "Chattanooga",
#     city: "Chattanooga",
#     state: "TN",
#     timezone: "America/New_York",
#     emoji: "🚂"
#   },
#   {
#     name: "Remote",
#     city: "Remote",
#     state: "Remote",
#     timezone: "Etc/UTC",
#     emoji: "🏠"
#   }
# ]
#
# offices = office_attributes.to_h do |attributes|
#   office_name = attributes.fetch(:name).downcase
#
#   office = Office.find_or_initialize_by(name: office_name)
#   office.update!(attributes)
#
#   [ office_name, office ]
# end
#
# puts "Seeding users..."
#
# seed_users = [
#   {
#     email: "jane.doe@viget.com",
#     first_name: "Jane",
#     last_name: "Doe",
#     office_name: "boulder"
#   },
#   {
#     email: "bob.hughes@viget.com",
#     first_name: "Bob",
#     last_name: "Hughes",
#     office_name: "boulder"
#   },
#   {
#     email: "alex.morgan@viget.com",
#     first_name: "Alex",
#     last_name: "Morgan",
#     office_name: "boulder"
#   },
#   {
#     email: "maya.patel@viget.com",
#     first_name: "Maya",
#     last_name: "Patel",
#     office_name: "boulder"
#   },
#   {
#     email: "noah.bennett@viget.com",
#     first_name: "Noah",
#     last_name: "Bennett",
#     office_name: "boulder"
#   },
#   {
#     email: "ryan.davis@viget.com",
#     first_name: "Ryan",
#     last_name: "Davis",
#     office_name: "boulder"
#   },
#   {
#     email: "chris.johnson@viget.com",
#     first_name: "Chris",
#     last_name: "Johnson",
#     office_name: "durham"
#   },
#   {
#     email: "jordan.lee@viget.com",
#     first_name: "Jordan",
#     last_name: "Lee",
#     office_name: "durham"
#   },
#   {
#     email: "avery.clark@viget.com",
#     first_name: "Avery",
#     last_name: "Clark",
#     office_name: "durham"
#   },
#   {
#     email: "devon.harris@viget.com",
#     first_name: "Devon",
#     last_name: "Harris",
#     office_name: "durham"
#   },
#   {
#     email: "lena.foster@viget.com",
#     first_name: "Lena",
#     last_name: "Foster",
#     office_name: "durham"
#   },
#   {
#     email: "quinn.bailey@viget.com",
#     first_name: "Quinn",
#     last_name: "Bailey",
#     office_name: "durham"
#   },
#   {
#     email: "sam.rivera@viget.com",
#     first_name: "Sam",
#     last_name: "Rivera",
#     office_name: "falls church"
#   },
#   {
#     email: "taylor.kim@viget.com",
#     first_name: "Taylor",
#     last_name: "Kim",
#     office_name: "falls church"
#   },
#   {
#     email: "priya.shah@viget.com",
#     first_name: "Priya",
#     last_name: "Shah",
#     office_name: "falls church"
#   },
#   {
#     email: "marcus.green@viget.com",
#     first_name: "Marcus",
#     last_name: "Green",
#     office_name: "falls church"
#   },
#   {
#     email: "sophie.turner@viget.com",
#     first_name: "Sophie",
#     last_name: "Turner",
#     office_name: "falls church"
#   },
#   {
#     email: "blake.robinson@viget.com",
#     first_name: "Blake",
#     last_name: "Robinson",
#     office_name: "falls church"
#   },
#   {
#     email: "casey.williams@viget.com",
#     first_name: "Casey",
#     last_name: "Williams",
#     office_name: "chattanooga"
#   },
#   {
#     email: "riley.nguyen@viget.com",
#     first_name: "Riley",
#     last_name: "Nguyen",
#     office_name: "chattanooga"
#   },
#   {
#     email: "eli.carter@viget.com",
#     first_name: "Eli",
#     last_name: "Carter",
#     office_name: "chattanooga"
#   },
#   {
#     email: "zoe.mitchell@viget.com",
#     first_name: "Zoe",
#     last_name: "Mitchell",
#     office_name: "chattanooga"
#   },
#   {
#     email: "owen.brooks@viget.com",
#     first_name: "Owen",
#     last_name: "Brooks",
#     office_name: "chattanooga"
#   },
#   {
#     email: "ryan.dunn@viget.com",
#     first_name: "Ryan",
#     last_name: "Dunn",
#     office_name: "chattanooga"
#   },
#   {
#     email: "jamie.brown@viget.com",
#     first_name: "Jamie",
#     last_name: "Brown",
#     office_name: "remote"
#   },
#   {
#     email: "morgan.davis@viget.com",
#     first_name: "Morgan",
#     last_name: "Davis",
#     office_name: "remote"
#   },
#   {
#     email: "cameron.wilson@viget.com",
#     first_name: "Cameron",
#     last_name: "Wilson",
#     office_name: "remote"
#   },
#   {
#     email: "drew.anderson@viget.com",
#     first_name: "Drew",
#     last_name: "Anderson",
#     office_name: "remote"
#   },
#   {
#     email: "harper.thomas@viget.com",
#     first_name: "Harper",
#     last_name: "Thomas",
#     office_name: "remote"
#   },
#   {
#     email: "reese.martin@viget.com",
#     first_name: "Reese",
#     last_name: "Martin",
#     office_name: "remote"
#   }
# ]
#
# users = seed_users.to_h do |attributes|
#   email = attributes.fetch(:email)
#   office_name = attributes.fetch(:office_name)
#
#   user = User.find_or_initialize_by(email: email)
#
#   user.assign_attributes(
#     first_name: attributes.fetch(:first_name),
#     last_name: attributes.fetch(:last_name),
#     office: offices.fetch(office_name)
#   )
#
#   if user.new_record?
#     user.password = "password"
#     user.password_confirmation = "password"
#   end
#
#   user.save!
#
#   [ email, user ]
# end
#
# puts "Seeding visits..."
#
# random = Random.new(20_260_716)
#
# physical_office_names = [
#   "boulder",
#   "durham",
#   "falls church",
#   "chattanooga"
# ].freeze
#
# visit_start_date = Date.new(2026, 5, 4)
# visit_end_date = Date.new(2026, 9, 25)
#
# users_by_home_office = users.values.group_by do |user|
#   user.office.name.downcase
# end
#
# def weekday?(date)
#   (1..5).cover?(date.wday)
# end
#
# def grouped_weekdays(start_date, end_date)
#   (start_date..end_date)
#     .select { |date| weekday?(date) }
#     .group_by { |date| date.beginning_of_week(:monday) }
# end
#
# def create_or_update_visit!(user:, office:, visit_date:)
#   visit = Visit.find_or_initialize_by(
#     user: user,
#     visit_date: visit_date
#   )
#
#   visit.update!(
#     office: office,
#   )
# end
#
# def varied_attendance(office_users, random)
#   shuffled_users = office_users.shuffle(random: random)
#
#   confirmed_count = random.rand(1..(office_users.length - 2))
#   remaining_count = office_users.length - confirmed_count
#   planned_count = random.rand(1..(remaining_count - 1))
#
#   {
#     confirmed: shuffled_users.first(confirmed_count),
#     planned: shuffled_users
#       .drop(confirmed_count)
#       .first(planned_count)
#   }
# end
#
# Visit.where(
#   visit_date: visit_start_date..visit_end_date
# ).delete_all
#
# weeks = grouped_weekdays(
#   visit_start_date,
#   visit_end_date
# )
#
# special_days = {}
#
# weeks.each_with_index do |(_week_start, dates), week_index|
#   physical_office_names.each_with_index do |office_name, office_index|
#     office = offices.fetch(office_name)
#     office_users = users_by_home_office.fetch(office_name)
#
#     all_in_date = nil
#     all_out_date = nil
#
#     if (week_index + office_index) % 3 == 0
#       all_in_date = dates.sample(random: random)
#     end
#
#     if (week_index + office_index) % 4 == 0
#       all_out_candidates = dates - [ all_in_date ]
#       all_out_date = all_out_candidates.sample(random: random)
#     end
#
#     special_days[[ office_name, week_index ]] = {
#       all_in: all_in_date,
#       all_out: all_out_date
#     }
#
#     dates.each do |date|
#       if date == all_in_date
#         shuffled_users = office_users.shuffle(random: random)
#         confirmed_count = random.rand(1...shuffled_users.length)
#
#         confirmed_users = shuffled_users.first(confirmed_count)
#         planned_users = shuffled_users.drop(confirmed_count)
#       elsif date == all_out_date
#         confirmed_users = []
#         planned_users = []
#       else
#         attendance = varied_attendance(
#           office_users,
#           random
#         )
#
#         confirmed_users = attendance.fetch(:confirmed)
#         planned_users = attendance.fetch(:planned)
#       end
#
#       confirmed_users.each do |user|
#         create_or_update_visit!(
#           user: user,
#           office: office,
#           visit_date: date,
#         )
#       end
#
#       planned_users.each do |user|
#         create_or_update_visit!(
#           user: user,
#           office: office,
#           visit_date: date,
#         )
#       end
#     end
#   end
# end
#
# physical_users = users.values.reject do |user|
#   user.office.name.downcase == "remote"
# end
#
# weeks.each_with_index do |(_week_start, dates), week_index|
#   physical_office_names.each_with_index do |office_name, office_index|
#     next unless (week_index + office_index).even?
#
#     office = offices.fetch(office_name)
#     office_special_days = special_days.fetch(
#       [ office_name, week_index ]
#     )
#
#     eligible_dates = dates - [
#       office_special_days.fetch(:all_in),
#       office_special_days.fetch(:all_out)
#     ].compact
#
#     visitor_date = eligible_dates.sample(random: random)
#     next unless visitor_date
#
#     eligible_visitors = physical_users.reject do |user|
#       user.office.name.downcase == office_name ||
#         Visit.exists?(
#           user: user,
#           visit_date: visitor_date
#         )
#     end
#
#     visitor = eligible_visitors.sample(random: random)
#     next unless visitor
#
#     create_or_update_visit!(
#       user: visitor,
#       office: office,
#       visit_date: visitor_date,
#     )
#   end
# end
#
# remote_users = users_by_home_office.fetch("remote")
#
# weeks.each_with_index do |(_week_start, dates), week_index|
#   office_name = physical_office_names[
#     week_index % physical_office_names.length
#   ]
#
#   office = offices.fetch(office_name)
#   remote_user = remote_users[
#     week_index % remote_users.length
#   ]
#
#   office_special_days = special_days.fetch(
#     [
#       office_name,
#       week_index
#     ]
#   )
#
#   eligible_dates = dates - [
#     office_special_days.fetch(:all_in),
#     office_special_days.fetch(:all_out)
#   ].compact
#
#   visit_date = eligible_dates.sample(random: random)
#   next unless visit_date
#
#   next if Visit.exists?(
#     user: remote_user,
#     visit_date: visit_date
#   )
#
#   create_or_update_visit!(
#     user: remote_user,
#     office: office,
#     visit_date: visit_date,
#   )
# end
#
# puts "Seed complete."
# puts "Offices: #{Office.count}"
# puts "Users: #{User.count}"
# puts "Visits: #{Visit.count}"
