class ScheduleSerializer
  include JSONAPI::Serializer
  attributes :id,
             :name,
             :city,
             :state,
             :timezone,
             :emoji
end
