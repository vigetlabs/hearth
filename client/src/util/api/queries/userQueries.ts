import { generateCurrentUserKey, generateUsersKey } from "../keys/userKeys";
import { HTTPError } from "ky";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, getUsers } from "../functions/users";

import type { User } from "@/types/api/users";

export function useCurrentUserQuery() {
  return useQuery<User | null, Error>({
    queryKey: generateCurrentUserKey(),
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        return response.data.user;
      } catch (error) {
        if (error instanceof HTTPError && error.response.status === 401) {
          return null;
        }
        throw error;
      }
    },
  });
}

// The full roster across every office. `buildWeekSchedule` narrows it to the
// office currently in view.
export function useRosterQuery() {
  return useQuery<User[]>({
    queryKey: generateUsersKey(),
    queryFn: async () => {
      const response = await getUsers();
      return response.data.users;
    },
  });
}
