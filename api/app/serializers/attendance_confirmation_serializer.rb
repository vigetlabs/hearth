class AttendanceConfirmationSerializer
  include JSONAPI::Serializer

  attributes :id,
             :user_id,
             :office_id,
             :period_type

  attribute :starts_on do |confirmation|
    confirmation.starts_on.iso8601
  end

  attribute :ends_on do |confirmation|
    confirmation.ends_on.iso8601
  end

  attribute :created_at do |confirmation|
    confirmation.created_at.iso8601
  end
end
