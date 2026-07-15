class UserSerializer
  include JSONAPI::Serializer
  attributes :id,
             :email,
             :first_name,
             :last_name,
             :office_id,
             :default_schedule
end
