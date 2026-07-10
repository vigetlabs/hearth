require 'rails_helper'

RSpec.describe "Api::V1::Schedules::Schedules", type: :request do
  describe "POST /schedules" do
    let(:valid_params) do
      {
        schedule: {
          is_default: true,
          monday: true,
          tuesday: false,
          wednesday: false,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        }
      }
    end

    let!(:user) { create(:user) }

    let(:auth_token) do
      post api_path("/users/login"), params: {
        user: {
          email: user.email,
          password: user.password
        }
      },
      as: :json
      response.cookies["jwt_token"]
    end

    let(:auth_header) do
      {
        "Cookie" => "jwt_token=#{auth_token}"
      }
    end

    context "with valid params and authentication" do
      it "creates a new schedule" do
        expect do
          post api_path("/schedules"),
            params: valid_params,
            headers: auth_header
        end.to change(Schedule, :count).by(1)
      end
    end
  end
end
