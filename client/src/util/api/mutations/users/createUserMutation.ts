import { createUser } from "@/util/api/functions/users";
import type { CreateUserRequest, User } from "@/types/api/users";
import { useMutation } from "@tanstack/react-query";

export function useCreateUserMutation() {
  return useMutation<User, Error, CreateUserRequest>({
    mutationFn: async (payload) => {
      const response = await createUser(payload);
      return response.data.user;
    },
  });
}
