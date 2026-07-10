import { redirect } from "react-router";
import { getCurrentUserOrNull } from "@/util/auth/getUserOrNull";

export async function redirectAuthenticatedUserLoader() {
  const user = await getCurrentUserOrNull();

  if (user) {
    throw redirect("/users/profile");
  }

  return null;
}
