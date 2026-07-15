class VisitSerializer
  include JSONAPI::Serializer
  attributes :id,
             :office_id,
             :visit_date,
             :created_at,
             :updated_at


  attribute :user do |visit|
    {
      id: visit.user.id,
      first_name: visit.user.first_name,
      last_name: visit.user.last_name
    }
  end
end
