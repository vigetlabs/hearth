import { useQuery } from "@tanstack/react-query";

import { generateVisitsKey } from "../keys/visitKeys";
import { getCurrentUserVisits, getVisits } from "../functions/visits";
import type {
  GetCurrentUserVisitsParams,
  GetVisitsParams,
  Visit,
} from "@/types/api/visits";
import { generateCurrentUserVisitsKey } from "../keys/userKeys";

export function useVisitsQuery({ date, view, office_id }: GetVisitsParams) {
  return useQuery<Visit[]>({
    queryKey: generateVisitsKey({
      date,
      view,
      office_id,
    }),
    queryFn: async () => {
      const response = await getVisits({
        date,
        view,
        office_id,
      });
      return response.data.visits;
    },
  });
}

export function useCurrentVisitsQuery({
  date,
  view,
}: GetCurrentUserVisitsParams) {
  return useQuery<Visit[]>({
    queryKey: generateCurrentUserVisitsKey(date, view),
    queryFn: async () => {
      const response = await getCurrentUserVisits({
        date,
        view,
      });
      return response.data.visits;
    },
  });
}
