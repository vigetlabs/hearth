import { api } from "@/util/api/api";

import type { OfficesResponse } from "@/types/api/offices";

export async function getOffices(): Promise<OfficesResponse> {
  const response = await api.get("/offices").json<OfficesResponse>();

  return response;
}
