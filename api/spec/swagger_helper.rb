# frozen_string_literal: true

require 'rails_helper'

Dir[Rails.root.join("spec/support/openapi/schemas/v1/**/*.rb")].sort.each { |file| require file }
RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  # NOTE: If you're using the rswag-api to serve API descriptions, you'll need
  # to ensure that it's configured to serve Swagger from the same folder
  config.openapi_root = Rails.root.join('swagger').to_s

  # Define one or more Swagger documents and provide global metadata for each one
  # When you run the 'rswag:specs:swaggerize' rake task, the complete Swagger will
  # be generated at the provided relative path under openapi_root
  # By default, the operations defined in spec files are added to the first
  # document below. You can override this behavior by adding a openapi_spec tag to the
  # the root example_group in your specs, e.g. describe '...', openapi_spec: 'v2/swagger.json'
  config.openapi_specs = {
    'v1/swagger.yaml' => {
      openapi: '3.0.1',
      info: {
        title: 'Hearth API',
        version: 'v1'
      },
      paths: {},
      servers: [
        {
          url: 'https://{defaultHost}',
          variables: {
            defaultHost: {
              default: 'www.example.com'
            }
          }
        }
      ],
      components: {
        schemas: {
          status: OpenApi::Schemas::V1::Statuses::STATUS_OBJECT,

          field_error: OpenApi::Schemas::V1::Errors::FIELD_ERROR,
          validation_error_response: OpenApi::Schemas::V1::Errors::VALIDATION_ERROR_RESPONSE,
          authentication_error_response: OpenApi::Schemas::V1::Errors::AUTHENTICATION_ERROR_RESPONSE,
          not_found_error_response: OpenApi::Schemas::V1::Errors::NOT_FOUND_ERROR_RESPONSE,
          bad_request_error_response: OpenApi::Schemas::V1::Errors::BAD_REQUEST_ERROR_RESPONSE,

          empty_success_response: OpenApi::Schemas::V1::Generics::EMPTY_SUCCESS_RESPONSE,

          schedule: OpenApi::Schemas::V1::Schedules::SCHEDULE_OBJECT,
          schedule_attributes: OpenApi::Schemas::V1::Schedules::SCHEDULE_ATTRIBUTES,
          create_schedule_request: OpenApi::Schemas::V1::Schedules::CREATE_SCHEDULE_REQUEST,
          schedule_response: OpenApi::Schemas::V1::Schedules::SCHEDULE_RESPONSE,
          schedules_response: OpenApi::Schemas::V1::Schedules::SCHEDULES_RESPONSE,

          office: OpenApi::Schemas::V1::Offices::OFFICE_OBJECT,
          office_response: OpenApi::Schemas::V1::Offices::OFFICE_RESPONSE,
          offices_response: OpenApi::Schemas::V1::Offices::OFFICES_RESPONSE,

          visit: OpenApi::Schemas::V1::Visits::VISIT_OBJECT,
          visit_date: OpenApi::Schemas::V1::Visits::VISIT_DATE,
          create_visits_request: OpenApi::Schemas::V1::Visits::CREATE_VISITS_REQUEST,
          visit_response: OpenApi::Schemas::V1::Visits::VISIT_RESPONSE,
          visits_response: OpenApi::Schemas::V1::Visits::VISITS_RESPONSE,

          user: OpenApi::Schemas::V1::Users::USER_OBJECT,
          user_response: OpenApi::Schemas::V1::Users::USER_RESPONSE,
          create_user_request: OpenApi::Schemas::V1::Users::CREATE_USER_REQUEST,
          login_user_request: OpenApi::Schemas::V1::Users::LOGIN_USER_REQUEST,
          patch_user_request: OpenApi::Schemas::V1::Users::PATCH_USER_REQUEST
        }
      }
    }
  }

  # Specify the format of the output Swagger file when running 'rswag:specs:swaggerize'.
  # The openapi_specs configuration option has the filename including format in
  # the key, this may want to be changed to avoid putting yaml in json files.
  # Defaults to json. Accepts ':json' and ':yaml'.
  config.openapi_format = :yaml
end
