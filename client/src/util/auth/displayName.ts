import type { User } from "@/types/api/users";

/** Short label like "Silvana M" — first name plus last initial. */
export function userDisplayName(user: User | null): string {
  if (!user) return "";
  return `${user.first_name} ${user.last_name[0] ?? ""}`.trim();
}
