import type {
  OfficeDatesPlanningOverrideStates,
} from "@/types/cable/officePlanning";

interface ResolvePlanningSelectedDatesInput {
  baseSelectedDates: string[];
  planningStatesByDate: OfficeDatesPlanningOverrideStates;
  currentUserId: number;
  weekDateKeys: readonly string[];
}

export function resolvePlanningSelectedDates({
  baseSelectedDates,
  planningStatesByDate,
  currentUserId,
  weekDateKeys
}: ResolvePlanningSelectedDatesInput): string[] {
  const selectedDates = new Set(baseSelectedDates);
  const weekDateKeySet = new Set(weekDateKeys);

  for (const [dateKey, overrides] of Object.entries(
    planningStatesByDate
  )) {
    if (!weekDateKeySet.has(dateKey)) {
      continue;
    }

    const isSelected = overrides.selected.some(
      (user) => user.id === currentUserId
    );

    const isDeselected = overrides.deselected.some(
      (user) => user.id === currentUserId
    )

    if (isSelected) {
      selectedDates.add(dateKey);
    } else if (isDeselected) {
      selectedDates.delete(dateKey);
    }
  }

  return weekDateKeys.filter((dateKey) =>
    selectedDates.has(dateKey)
  );
}
