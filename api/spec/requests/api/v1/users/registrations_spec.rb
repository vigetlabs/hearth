require 'rails_helper'

RSpec.describe "Api::V1::Users::Registrations", type: :request do
  describe "POST /users" do
    let(:valid_params) do
      {
        user: {
          email: "user@example.com",
          first_name: "Ryan",
          last_name: "Dioneda",
          password: "password",
          password_confirmation: "password"
        }
      }
    end

    context "with valid params" do
      it "creates a new user" do
        expect do
          post api_path("/users"), params: valid_params
        end.to change(User, :count).by(1)
      end

      it "returns a success response" do
        post api_path("/users"), params: valid_params
        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["status"]["message"]).to eq("User created successfully")
        user_data = json["data"]["user"]
        expect(user_data["email"]).to eq("user@example.com")
        expect(user_data["first_name"]).to eq("Ryan")
        expect(user_data["last_name"]).to eq("Dioneda")
      end

      it "does not expose password fields" do
        post api_path("/users"), params: valid_params
        json = JSON.parse(response.body)
        user_json = json["data"]["user"]
        expect(user_json).not_to have_key("password")
        expect(user_json).not_to have_key("password_confirmation")
        expect(user_json).not_to have_key("encrypted_password")
      end
    end

    context "with invalid params" do
      let(:invalid_params) do
        {
          user: {
            email: "",
            first_name: "",
            last_name: "",
            password: "password123",
            password_confirmation: "diffpassword"
          }
        }
      end

      it "does not create a new user" do
        expect do
          post api_path("/users"), params: invalid_params
        end.not_to change(User, :count)
      end

      it "returns an error response" do
        post api_path("/users"), params: invalid_params
        expect(response).to have_http_status(:unprocessable_content)
        json = JSON.parse(response.body)

        expect(json["status"]["code"]).to eq(422)
        expect(json["status"]["message"]).to eq("Validation failed.")

        expect(get_error_type(json)).to eq(ApiErrorTypes::VALIDATION)
        expect(get_error_code(json)).to eq(ApiErrorCodes::Validation::INVALID_ATTRIBUTES)
        error_details = get_error_details(json)
        expect(error_details).to be_an(Array)

        expect(error_details).to include(
          hash_including(
            "field" => "email",
            "message" => "can't be blank"
          )
        )
        expect(error_details).to include(
          hash_including(
            "field" => "first_name",
            "message" => "can't be blank"
          )
        )
        expect(error_details).to include(
          hash_including(
            "field" => "last_name",
            "message" => "can't be blank"
          )
        )
      end
    end
  end
end
