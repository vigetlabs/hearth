import type {
  PlanningOverrideState,
  TogglePlanningOverrideState,
} from "@/types/cable/officePlanning";

export function setPlanningOverrideStateForUser(
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
