import { useQuery } from "@tanstack/react-query";

import type { MockVisit } from "@/util/api/mock/visits";
import { generateVisitsKey } from "../keys/visitKeys";
import { getVisits } from "../functions/visits";

// Every office's visits for the sample week. `buildWeekSchedule` filters them
// down to the office in view.
export function useVisitsQuery() {
  return useQuery<MockVisit[]>({
    queryKey: generateVisitsKey(),
    queryFn: async () => {
      const response = await getVisits();
      return response.data.visits;
    },
  });
}
