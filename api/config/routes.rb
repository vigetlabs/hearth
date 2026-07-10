Rails.application.routes.draw do
  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"
  devise_for :users,
    path: "api/v1/users",
    path_names: {
      sign_in: "login",
      sign_out: "logout"
    },
    controllers: {
      sessions: "api/v1/users/sessions",
      registrations: "api/v1/users/registrations",
      omniauth_callbacks: "api/v1/users/omniauth_callbacks"
    }

  namespace :api do
    namespace :v1 do
      get "up" => "rails/health#show", as: :rails_health_check
      get "health", to: "health#show"

      scope "users" do
        get "/me", to: "users/users#me"

        # frontend facing google_oauth routes
        get "/auth/google", to: "users/google_oauth#redirect"
        get "/auth/failure", to: "users/google_oauth#failure"
      end
    end
  end
end
