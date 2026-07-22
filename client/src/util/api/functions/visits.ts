import type {
  GetCurrentUserVisitsParams,
  GetVisitsParams,
  VisitsResponse,
} from "@/types/api/visits";
import { api } from "@/util/api/api";

export async function getVisits({
  date,
  view,
  office_id,
}: GetVisitsParams): Promise<VisitsResponse> {
  const response = api
    .get("/visits", {
      searchParams: {
        ...(date && { date }),
        ...(view && { view }),
        office_id,
      },
    })
    .json<VisitsResponse>();
  return response;
}

export async function getCurrentUserVisits({
  date,
  view,
}: GetCurrentUserVisitsParams): Promise<VisitsResponse> {
  const response = api
    .get("/visits/mine", {
      searchParams: {
        date,
        view,
      },
    })
    .json<VisitsResponse>();
  return response;
}
