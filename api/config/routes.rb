Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get "up" => "rails/health#show", as: :rails_health_check
      get "health", to: "health#show"

      devise_for :users,
        path: "users",
        controllers: {
          registrations: "users/registrations"
        }
    end
  end
end
