import type { User } from "@/types/api/users";
import type { ChannelSerializedUser } from "../cable/useOfficePlanning";

export function userDisplayName(
  user: User | ChannelSerializedUser | null,
): string {
  if (!user) return "";
  return `${user.first_name} ${user.last_name[0] ?? ""}`.trim();
}
