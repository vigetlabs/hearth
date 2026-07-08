import { loginUser } from "@/util/api/functions/users";
import type { LoginUserRequest, User } from "@/types/api/users";
import { useMutation } from "@tanstack/react-query";

export function useLoginUserMutation() {
  return useMutation<User, Error, LoginUserRequest>({
    mutationFn: async (payload) => {
      const response = await loginUser(payload);
      return response.data.user;
    },
  });
}
