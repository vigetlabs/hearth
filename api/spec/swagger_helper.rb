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
        title: 'Intern Project API',
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

          user: OpenApi::Schemas::V1::Users::USER_OBJECT,
          user_response: OpenApi::Schemas::V1::Users::USER_RESPONSE,
          create_user_request: OpenApi::Schemas::V1::Users::CREATE_USER_REQUEST,

          error: OpenApi::Schemas::V1::Errors::ERROR_OBJECT,
          error_response: OpenApi::Schemas::V1::Errors::ERROR_RESPONSE,
          validation_error_response: OpenApi::Schemas::V1::Errors::VALIDATION_ERROR_RESPONSE
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
