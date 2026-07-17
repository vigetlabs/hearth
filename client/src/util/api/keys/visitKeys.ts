import type { GetVisitsParams } from "@/types/api/visits";

export function generateVisitsKey({ date, view, office_id }: GetVisitsParams) {
  return ["visits", { date, view, office_id }] as const;
}
