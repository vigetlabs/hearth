import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "../../functions/users";
import type { EmptySuccessResponse } from "@/types/api/generics";

export function useLogoutUserMutation() {
  return useMutation<EmptySuccessResponse, Error>({
    mutationFn: async () => {
      const response = await logoutUser();
      return response;
    },
  });
}
