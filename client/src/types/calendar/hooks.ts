import type { useCalendarOfficeSelection } from "@/hooks/useCalendarOfficeSelection"
import type { Office } from "../api/offices";
import type { useCalendarWeekSelection } from "@/hooks/useCalendarWeekSelection";

export type OfficeSelection = ReturnType<typeof useCalendarOfficeSelection>
export type WeekSelection = ReturnType<typeof useCalendarWeekSelection>

export interface ResolvedOfficeSelection extends OfficeSelection {
  activeOffice: Office;
}

