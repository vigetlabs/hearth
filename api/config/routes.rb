Rails.application.routes.draw do
  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"
  namespace :api do
    namespace :v1 do
      get "up" => "rails/health#show", as: :rails_health_check
      get "health", to: "health#show"

      devise_for :users,
        path: "users",
        controllers: {
          registrations: "api/v1/users/registrations"
        }
    end
  end
end
