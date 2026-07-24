import { getCurrentUserOrNull } from "@/util/auth/getUserOrNull";
import { redirect } from "react-router";

export async function officePickerLoader() {
  const user = await getCurrentUserOrNull();

  if (!user) {
    throw redirect("/");
  }

  if (user.office && !user.default_schedule) {
    throw redirect("/users/schedule");
  }

  if (user.office && user.default_schedule) {
    throw redirect("/users/profile");
  }

  return { user };
}
