Rails.application.routes.draw do
  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"
  mount ActionCable.server => "/cable"
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
      post "slack/interactions", to: "slack/slack_interactions#create"


      resources :users, only: [ :index ], module: :users do
        collection do
          get :me
          patch :me, action: :update
        end
      end

      scope "users/auth" do
        # frontend facing google_oauth routes
        get "/google", to: "users/google_oauth#redirect"
        get "/failure", to: "users/google_oauth#failure"
      end

      resources :schedules, only: [ :create ], module: :schedules do
        collection do
          get :default, action: :default
        end
      end

      resources :offices, only: [ :index ], module: :offices

      resources :visits, only: [ :create, :index ], module: :visits do
        collection do
          get :mine
        end
      end

      resources :attendance_confirmations, only: [ :create, :index ], module: :attendance_confirmations
    end
  end
end
