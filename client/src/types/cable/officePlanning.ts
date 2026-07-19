import type { User } from "@/types/api/users";

export type ChannelSerializedUser = Pick<
  User,
  "id" | "first_name" | "last_name" | "office_id"
>;

export type PlanningOverrideState = "selected" | "deselected" | null;

export interface TogglePlanningOverrideState {
  selected: ChannelSerializedUser[];
  deselected: ChannelSerializedUser[];
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
 *         office_id:
 *       }
 *     ]
 *   },
 *   deselected: {
 *     [
 *       {
 *         id:
 *         first_name:
 *         last_name:
 *         office_id:
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
