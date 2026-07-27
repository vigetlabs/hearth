import type { Office } from "@/types/api/offices";
import type { User } from "@/types/api/users";

export interface CalendarScope {
  user: User;
  offices: readonly Office[];
  activeOffice: Office;
  focusedWeekStart: Date;
  focusedWeekStartKey: string;
  changeOffice: (office: Office) => void;
  changeWeek: (nextWeek: Date) => void;
}
