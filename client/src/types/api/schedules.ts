import type { components } from "@/types/api/openapi-schemas";

export type Schedule = components["schemas"]["schedule"];

export type CreateScheduleRequest =
  components["schemas"]["create_schedule_request"];

export type ScheduleResponse = components["schemas"]["schedule_response"];

export type SchedulesResponse = components["schemas"]["schedules_response"];
