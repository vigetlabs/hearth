import { generateCurrentUserKey } from "../keys/userKeys";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserOrNull } from "@/util/auth/getUserOrNull";

import type { User } from "@/types/api/users";

// Shares the same "call /me, treat 401 as signed-out" logic used by the route
// loaders (see getCurrentUserOrNull) so there is one source of truth for it.
export function useCurrentUserQuery() {
  return useQuery<User | null, Error>({
    queryKey: generateCurrentUserKey(),
    queryFn: getCurrentUserOrNull,
  });
}
