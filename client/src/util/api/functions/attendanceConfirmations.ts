import type {
  CreateAttendanceConfirmationRequest,
  CreateAttendanceConfirmationResponse,
  AttendanceConfirmationsResponse,
} from "@/types/api/attendanceConfirmations";
import { api } from "../api";

interface AttendanceConfirmationRequestParams {
  officeId: number;
  startsOn: string;
  selectedDates: string[];
}

export function createAttendanceConfirmationObjectPayload({
  officeId,
  startsOn,
  selectedDates,
}: AttendanceConfirmationRequestParams): CreateAttendanceConfirmationRequest {
  return {
    office_id: officeId,
    starts_on: startsOn,
    selected_dates: selectedDates,
  };
}

export async function createAttendanceConfirmation(
  payload: CreateAttendanceConfirmationRequest,
): Promise<CreateAttendanceConfirmationResponse> {
  const response = await api
    .post("/attendance_confirmations", {
      json: payload,
    })
    .json<CreateAttendanceConfirmationResponse>();

  return response;
}

interface GetAttendanceConfirmationsRequest {
  office_id: number;
  starts_on: string;
}

export function getAttendanceConfirmations(
  params: GetAttendanceConfirmationsRequest,
) {
  return api
    .get("/attendance_confirmations", {
      searchParams: {
        office_id: params.office_id,
        starts_on: params.starts_on,
      },
    })
    .json<AttendanceConfirmationsResponse>();
}
