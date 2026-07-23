import type { User } from "@/types/api/users";

export function userDisplayName(
  user: Pick<User, "first_name" | "last_name"> | null,
): string {
  if (!user) return "";
  return `${user.first_name} ${user.last_name[0] ?? ""}`.trim();
}
