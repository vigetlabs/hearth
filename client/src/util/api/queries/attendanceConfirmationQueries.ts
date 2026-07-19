import { useQuery } from "@tanstack/react-query";
import type { AttendanceConfirmation } from "@/types/api/attendanceConfirmations";
import { generateAttendanceConfirmationKey } from "../keys/attendanceConfirmationsKeys";
import { getAttendanceConfirmations } from "../functions/attendanceConfirmations";

interface UseAttendanceConfirmationsQueryParams {
  officeId: number;
  startsOn: string;
}

export function useAttendanceConfirmationsQuery({
  officeId,
  startsOn,
}: UseAttendanceConfirmationsQueryParams) {
  return useQuery<AttendanceConfirmation[], Error>({
    queryKey: generateAttendanceConfirmationKey(officeId, startsOn),
    queryFn: async () => {
      if (officeId === undefined) {
        throw new Error("Office ID is required");
      }

      const response = await getAttendanceConfirmations({
        office_id: officeId,
        starts_on: startsOn,
      });

      return response.data.confirmations;
    },
    enabled: officeId !== undefined && startsOn.length > 0,
  });
}
