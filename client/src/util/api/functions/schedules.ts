import { api } from "@/util/api/api";
import type {
  CreateScheduleRequest,
  ScheduleResponse,
} from "@/types/api/schedules";

export function createDefaultScheduleObjectPayload(
  selectedDayIds: Set<string>,
): CreateScheduleRequest {
  return {
    schedule: {
      monday: selectedDayIds.has("monday"),
      tuesday: selectedDayIds.has("tuesday"),
      wednesday: selectedDayIds.has("wednesday"),
      thursday: selectedDayIds.has("thursday"),
      friday: selectedDayIds.has("friday"),
      saturday: selectedDayIds.has("saturday"),
      sunday: selectedDayIds.has("sunday"),
      is_default: true,
    },
  };
}
export async function createDefaultSchedule(
  payload: CreateScheduleRequest,
): Promise<ScheduleResponse> {
  const response = await api
    .post("/schedules", {
      json: payload,
    })
    .json<ScheduleResponse>();

  return response;
}
