class VisitSerializer
  include JSONAPI::Serializer
  attributes :id,
             :office_id,
             :visit_date,
             :created_at,
             :updated_at

  attribute :user do |visit|
    UserSerializer.new(visit.user).serializable_hash[:data][:attributes]
      .merge(id: visit.user.id)
  end
end
