class UserSerializer
  include JSONAPI::Serializer
  attributes :id,
             :email,
             :first_name,
             :last_name,
             :default_schedule

  attribute :office do |user|
    next unless user.office

    {
      id: user.office.id,
      name: user.office.name
    }
  end
end
