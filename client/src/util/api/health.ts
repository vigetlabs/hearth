import { api } from "@/util/api/api";

export async function getHealth() {
  return api.get("health").json<{ status: string }>();
}
