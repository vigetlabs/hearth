import type {
  CreateAttendanceConfirmationRequest,
  CreateAttendanceConfirmationResponse,
} from "@/types/api/attendanceConfirmations";
import { useMutation } from "@tanstack/react-query";
import { createAttendanceConfirmation } from "../../functions/attendanceConfirmations";

export function useWeekAttendanceConfirmation() {
  return useMutation<
    CreateAttendanceConfirmationResponse,
    Error,
    CreateAttendanceConfirmationRequest
  >({
    mutationFn: async (payload) => {
      const response = await createAttendanceConfirmation(payload);
      return response;
    },
  });
}
