require "swagger_helper"

RSpec.describe "Api::V1::Schedules::Schedules", type: :request do
  path "/api/v1/schedules" do
    post "Creates a schedule" do
      tags "Schedules"
      consumes "application/json"
      produces "application/json"

      parameter name: :payload,
        in: :body,
        required: true,
        schema: { "$ref" => "#/components/schemas/create_schedule_request" }
    end
  end
end
