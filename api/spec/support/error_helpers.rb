module ErrorHelpers
  def get_error_code(json)
    json["error"]["code"]
  end

  def get_error_type(json)
    json["error"]["type"]
  end

  def get_error_details(json)
    json["error"]["details"]
  end
end
