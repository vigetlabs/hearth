require "swagger_helper"

RSpec.describe "Api::V1::Users::Users", type: :request do
  path "/api/v1/users/me" do
    get "Fetches user information for current authenticated user" do
      tags "Users"
      produces "application/json"
      security [ cookie_auth: [] ]

      response "200", "fetched user successfully" do
        schema "$ref" => "#/components/schemas/user_response"

        let!(:user) { create(:user) }

        before do
          sign_in user
        end

        run_test!
      end
    end
  end
end
