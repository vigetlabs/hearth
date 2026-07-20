import type {
  PlanningOverrideState,
  TogglePlanningOverrideState,
} from "@/types/cable/officePlanning";
import type { RosterUser } from "@/types/calendar/calendar";
import { isInOffice } from "@/types/calendar/calendar";

export function planningOverrideStateForUser(
  overrides: TogglePlanningOverrideState | undefined,
  userId: number,
): PlanningOverrideState {
  if (!overrides) {
    return null;
  }

  const isSelected = overrides.selected.some(
    (planningUser) => planningUser.id === userId,
  );

  if (isSelected) {
    return "selected";
  }

  const isDeselected = overrides.deselected.some(
    (planningUser) => planningUser.id === userId,
  );

  if (isDeselected) {
    return "deselected";
  }

  return null;
}

interface ResolveAttendanceOptions {
  hasConfirmedVisit: boolean;
  planningOverrideState: PlanningOverrideState;
  isDefaultScheduleDay: boolean;
}

/*
 * Attendance information comes from the following sources:
 *
 * 1. Confirmed visit in the database
 * 2. A live "selected" planning override
 * 3. A live "deselected" planning override
 * 4. The user's default weekly schedule
 * 5. No attendance information at all
 *
 * This function centralizes the priority rules between these sources.
 */
export function resolveAttendance({
  hasConfirmedVisit,
  planningOverrideState,
  isDefaultScheduleDay,
}: ResolveAttendanceOptions): boolean {
  if (hasConfirmedVisit) {
    return true;
  }

  if (planningOverrideState === "selected") {
    return true;
  }

  if (planningOverrideState === "deselected") {
    return false;
  }

  return isDefaultScheduleDay;
}

export function resolveEditingAttendance({
  hasConfirmedVisit,
  planningOverrideState,
}: {
  hasConfirmedVisit: boolean;
  planningOverrideState: PlanningOverrideState;
}): boolean {
  if (planningOverrideState === "selected") {
    return true;
  }

  if (planningOverrideState === "deselected") {
    return false;
  }

  return hasConfirmedVisit;
}

interface BaseAttendanceForUserOptions {
  day: RosterUser[];
  userId: number;
}

interface BaseAttendanceForUserResult {
  hasConfirmedVisit: boolean;
  isDefaultScheduleDay: boolean;
}

/*
 * Determines the user's attendance information for one day before live
 * planning overrides are applied
 */
export function baseAttendanceForUser({
  day,
  userId,
}: BaseAttendanceForUserOptions): BaseAttendanceForUserResult {
  const person = day.find((dayPerson) => dayPerson.userId === userId);

  if (!person) {
    return {
      hasConfirmedVisit: false,
      isDefaultScheduleDay: false,
    };
  }

  const hasConfirmedVisit = person.status === "confirmed-yes";

  return {
    hasConfirmedVisit,
    isDefaultScheduleDay: !hasConfirmedVisit && isInOffice(person.status),
  };
}
