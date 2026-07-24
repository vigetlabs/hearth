import { redirect } from "react-router";
import { getCurrentUserOrNull } from "@/util/auth/getUserOrNull";

export async function signinLoader() {
  const user = await getCurrentUserOrNull();

  if (!user) {
    return null;
  }

  if (!user.office) {
    throw redirect("/users/office");
  }

  if (!user.default_schedule) {
    throw redirect("/users/schedule");
  }

  throw redirect("/calendar");
}
