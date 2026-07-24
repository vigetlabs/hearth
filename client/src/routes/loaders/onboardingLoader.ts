import { redirect } from "react-router";
import { getCurrentUserOrNull } from "@/util/auth/getUserOrNull";

export async function onboardingLoader() {
  const user = await getCurrentUserOrNull();

  if (!user) {
    throw redirect("/");
  }

  if (!user.office) {
    throw redirect("/users/office");
  }

  if (!user.default_schedule) {
    throw redirect("/users/schedule");
  }

  return { user };
}
