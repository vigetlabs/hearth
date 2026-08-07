import type { User } from "@/types/api/users";

export type PlanningOverrideState = "selected" | "deselected" | null;

export interface TogglePlanningOverrideState {
  selected: User[];
  deselected: User[];
}

export interface OfficePlanningState {
  officeId: number;
  dates: OfficeDatesPlanningOverrideStates;
}

/* {
 * "2026-07-13": {
 *   selected: {
 *     [
 *       {
 *         id:
 *         first_name:
 *         last_name:
 *         office:
 *       }
 *     ]
 *   },
 *   deselected: {
 *     [
 *       {
 *         id:
 *         first_name:
 *         last_name:
 *         office:
 *       }
 *     ]
 *   }
 * }
 * }
 */
export type OfficeDatesPlanningOverrideStates = Record<
  string,
  TogglePlanningOverrideState
>;
