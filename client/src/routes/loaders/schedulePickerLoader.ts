import { getCurrentUserOrNull } from "@/util/auth/getUserOrNull";
import { redirect } from "react-router";

export async function schedulePickerLoader() {
  const user = await getCurrentUserOrNull();

  if (!user) {
    throw redirect("/");
  }

  if (!user.office) {
    throw redirect("/users/office");
  }

  if (user.default_schedule) {
    throw redirect("/users/profile");
  }

  return { user };
}
