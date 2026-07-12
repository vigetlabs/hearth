import type { components } from "@/types/api/openapi-schemas";

export type ValidationErrorResponse =
  components["schemas"]["validation_error_response"];

export type AuthenticationErrorResponse =
  components["schemas"]["authentication_error_response"];

export type NotFoundErrorResponse =
  components["schemas"]["not_found_error_response"];

export type BadRequestErrorResponse =
  components["schemas"]["bad_request_error_response"];
