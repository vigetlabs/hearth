import { useQuery } from "@tanstack/react-query";

import type { Office } from "@/types/api/offices";
import { generateOfficesKey } from "@/util/api/keys/officeKeys";
import { getOffices } from "@/util/api/functions/offices";

export function useOfficesQuery(enabled = true) {
  return useQuery<Office[]>({
    queryKey: generateOfficesKey(),
    queryFn: async () => {
      const response = await getOffices();
      return response.data.offices;
    },
    enabled,
  });
}
