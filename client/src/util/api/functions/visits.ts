import type { GetVisitsParams, VisitsResponse } from "@/types/api/visits";
import { api } from "@/util/api/api";

export async function getVisits({
  date,
  view,
}: GetVisitsParams): Promise<VisitsResponse> {
  const response = api
    .get("/visits", {
      searchParams: {
        ...(date && { date }),
        ...(view && { view }),
      },
    })
    .json<VisitsResponse>();
  return response;
}
