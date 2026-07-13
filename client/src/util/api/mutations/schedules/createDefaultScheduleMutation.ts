import type { Schedule, CreateScheduleRequest } from "@/types/api/schedules";

import { createDefaultSchedule } from "@/util/api/functions/schedules";
import { useMutation } from "@tanstack/react-query";

export function useCreateDefaultScheduleMutation() {
  return useMutation<Schedule, Error, CreateScheduleRequest>({
    mutationFn: async (payload) => {
      const response = await createDefaultSchedule(payload);
      return response.data.schedule;
    },
  });
}
