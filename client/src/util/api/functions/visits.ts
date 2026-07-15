import {
  mockVisitsResponse,
  type MockVisitsResponse,
} from "@/util/api/mock/visits";

// The visits index isn't wired to the client yet, so this resolves the mock in
// the real response shape. The real endpoint takes `date`/`view` query params
// and returns every office's visits for the week (the client filters by office
// in `buildWeekSchedule`); swapping in `api.get("/visits", { searchParams })`
// later touches nothing outside this function.
export async function getVisits(): Promise<MockVisitsResponse> {
  return Promise.resolve(mockVisitsResponse);
}
