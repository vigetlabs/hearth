import { redirect } from "react-router";
import { getCurrentUserOrNull } from "@/util/auth/getUserOrNull";

export async function authLoader() {
  const user = await getCurrentUserOrNull();

  if (!user) {
    throw redirect("/users/login");
  }

  return user;
}
