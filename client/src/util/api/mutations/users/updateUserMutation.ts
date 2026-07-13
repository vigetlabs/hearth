import { updateUser } from "@/util/api/functions/users";
import type { PatchUserRequest, User } from "@/types/api/users";
import { useMutation } from "@tanstack/react-query";

export function useUpdateUserMutation() {
  return useMutation<User, Error, PatchUserRequest>({
    mutationFn: async (payload) => {
      const response = await updateUser(payload);
      return response.data.user;
    },
  });
}
