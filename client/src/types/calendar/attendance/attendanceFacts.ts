export type AttendanceMode = "planning" | "confirmed" | "editing";
export type PlanningOverride = "selected" | "deselected" | null;

export interface CalendarDateAttendanceFacts {
  /*
   * Represents a person's state for this week. Editing takes
   * precedence over confirmed when deriving this value
   */
  mode: AttendanceMode;

  /*
   * Whether the database contains a visit for this person @ the office
   * currently being viewed on this date
   */
  hasVisitHere: boolean;

  /*
   * Whether the current user has a visit dat a different office on this date.
   * The application only has this information for the current user
   */
  hasVisitElsewhere: boolean;

  /*
   * Whether the person's recurring default schedule includes this weekday.
   * This is only used in planning mode.
   */
  defaultScheduled: boolean;

  /*
   * Live action cable planning override for this person and date
   */
  planningOverride: PlanningOverride;
}
