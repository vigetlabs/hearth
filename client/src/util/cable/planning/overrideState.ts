import type {
  PlanningOverrideState,
  TogglePlanningOverrideState,
} from "@/types/cable/officePlanning";

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

interface ResolveEditingAttendanceOptions {
  hasConfirmedVisit: boolean;
  planningOverrideState: PlanningOverrideState;
}

export function resolveEditingAttendance({
  hasConfirmedVisit,
  planningOverrideState,
}: ResolveEditingAttendanceOptions): boolean {
  if (planningOverrideState === "selected") {
    return true;
  }

  if (planningOverrideState === "deselected") {
    return false;
  }

  return hasConfirmedVisit;
}
