class ScheduleSerializer
  include JSONAPI::Serializer
  attributes :id,
             :is_default,
             :monday,
             :tuesday,
             :wednesday,
             :thursday,
             :friday,
             :saturday,
             :sunday
end
