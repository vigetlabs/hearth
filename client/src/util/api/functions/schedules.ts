import { api } from "@/util/api/api";
import type {
  CreateScheduleRequest,
  ScheduleResponse,
} from "@/types/api/schedules";

interface ScheduleAttributes {
  is_default: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export function buildScheduleAttributes(
  selectedDayIds: Set<string>,
): ScheduleAttributes {
  return {
    is_default: true,
    monday: selectedDayIds.has("monday"),
    tuesday: selectedDayIds.has("tuesday"),
    wednesday: selectedDayIds.has("wednesday"),
    thursday: selectedDayIds.has("thursday"),
    friday: selectedDayIds.has("friday"),
    saturday: selectedDayIds.has("saturday"),
    sunday: selectedDayIds.has("sunday"),
  };
}

export function createDefaultScheduleObjectPayload(
  selectedDayIds: Set<string>,
): CreateScheduleRequest {
  return {
    schedule: buildScheduleAttributes(selectedDayIds),
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
