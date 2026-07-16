import { useQuery } from "@tanstack/react-query";

import { generateVisitsKey } from "../keys/visitKeys";
import { getVisits } from "../functions/visits";
import type { GetVisitsParams, Visit } from "@/types/api/visits";

export function useVisitsQuery({ date, view }: GetVisitsParams) {
  return useQuery<Visit[]>({
    queryKey: generateVisitsKey(),
    queryFn: async () => {
      const response = await getVisits({ date, view });
      return response.data.visits;
    },
  });
}
