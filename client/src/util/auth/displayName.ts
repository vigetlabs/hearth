import type { User } from "@/types/api/users";
import type { ChannelSerializedUser } from "@/types/cable/officePlanning";

export function userDisplayName(
  user: User | ChannelSerializedUser | null,
): string {
  if (!user) return "";
  return `${user.first_name} ${user.last_name[0] ?? ""}`.trim();
}
