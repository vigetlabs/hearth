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

    patch "Updates user information for current authenticated user" do
      tags "Users"
      consumes "application/json"
      produces "application/json"
      security [ cookie_auth: [] ]

      parameter name: :payload,
        in: :body,
        required: true,
        schema: { "$ref" => "#/components/schemas/patch_user_request" }

      response "200", "updated user successfully" do
        schema "$ref" => "#/components/schemas/user_response"

        let!(:user) { create(:user) }
        let(:payload) do
          {
            user: {
              first_name: "Updated",
              last_name: "User"
            }
          }
        end

        before do
          sign_in user
        end

        run_test!
      end
    end
  end
end
