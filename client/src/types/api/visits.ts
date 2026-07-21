import type { components } from "@/types/api/openapi-schemas";

export type Visit = components["schemas"]["visit"];

export type CreateVisitRequest = components["schemas"]["create_visits_request"];

export type VisitResponse = components["schemas"]["visit_response"];

export type VisitsResponse = components["schemas"]["visits_response"];

export interface GetVisitsParams {
  date?: string;
  view?: "week";
  office_id: number;
}

export interface GetCurrentUserVisitsParams {
  date?: string;
  view?: "week";
}
