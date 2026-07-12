class ErrorCodeGenerator
  def self.authentication_required
    "authentication_required"
  end

  def self.invalid_attributes
    "invalid_attributes"
  end

  def self.resource_not_found(resource)
    "#{resource}_not_found"
  end
end
