import { HTTPError } from "ky";
import { getCurrentUser } from "@/util/api/functions/users";
import type { User } from "@/types/api/users";

export async function getCurrentUserOrNull(): Promise<User | null> {
  try {
    const response = await getCurrentUser();
    return response.data.user;
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 401) {
      return null;
    }

    throw error;
  }
}
