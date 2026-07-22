import type { components } from "@/types/api/openapi-schemas";

export type AttendanceConfirmationPeriodType = "week";

export type AttendanceConfirmation =
  components["schemas"]["attendance_confirmation"];

export type CreateAttendanceConfirmationRequest =
  components["schemas"]["create_attendance_confirmation_request"];

export type AttendanceConfirmationsResponse =
  components["schemas"]["attendance_confirmations_response"];

export type CreateAttendanceConfirmationResponse =
  components["schemas"]["create_attendance_confirmation_response"];
