import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  OfficeDatesPlanningOverrideStates,
  OfficePlanningState,
  TogglePlanningOverrideState,
} from "@/types/cable/officePlanning";

import {
  subscribeShared,
  type SharedSubscription,
} from "../sharedSubscription";
import { useQueryClient } from "@tanstack/react-query";
import { generateOfficesUsersKey } from "@/util/api/keys/officeKeys";

const EMPTY_PLANNING_DATES: OfficeDatesPlanningOverrideStates = {};

/*
 * Represents a snapshot of all dates and all users on that date
 */
interface PlanningSnapshotMessage {
  type: "planning.snapshot";
  office_id: number;
  dates: OfficeDatesPlanningOverrideStates;
}

/*
 * Represents a single date update for all users on that date
 */
interface PlanningDateUpdatedMessage {
  type: "planning.date.updated";
  office_id: number;
  date: string;
  overrides: TogglePlanningOverrideState;
}

interface RosterUpdatedMessage {
  type: "planning.roster.updated";
  office_id: number;
}

type OfficePlanningMessage =
  PlanningSnapshotMessage | PlanningDateUpdatedMessage | RosterUpdatedMessage;

interface ConnectionState {
  officeId: number;
  connected: boolean;
}

interface CurrentUserPlanningOverrideState {
  selectedDates: string[];
  deselectedDates: string[];
}

interface UseOfficePlanningOptions {
  officeId: number | null;
  currentUserId: number | null;
  dates: string[];
}

interface UseOfficePlanningResult {
  planningStatesByDate: OfficeDatesPlanningOverrideStates;
  hasInitialSnapshot: boolean;
  isConnected: boolean;
  selectDate: (date: string) => void;
  deselectDate: (date: string) => void;
  clearDates: (dates: string[]) => void;
  refreshSnapshot: () => void;
}

const EMPTY_CURRENT_USER_OVERRIDES: CurrentUserPlanningOverrideState = {
  selectedDates: [],
  deselectedDates: [],
};

export function useOfficePlanning({
  officeId,
  currentUserId,
  dates,
}: UseOfficePlanningOptions): UseOfficePlanningResult {
  const [hasInitialSnapshot, setHasInitialSnapshot] =
    useState<boolean>(false);

  const [planningState, setPlanningState] =
    useState<OfficePlanningState | null>(null);

  const [connectionState, setConnectionState] =
    useState<ConnectionState | null>(null);

  const planningStatesByDate =
    officeId !== null && planningState?.officeId === officeId
      ? planningState.dates
      : EMPTY_PLANNING_DATES;

  const isConnected =
    officeId !== null &&
    connectionState?.officeId === officeId &&
    connectionState.connected;

  const queryClient = useQueryClient();

  const subscriptionRef = useRef<SharedSubscription | null>(null);
  const datesRef = useRef(dates);

  const datesKey = useMemo(() => [...dates].sort().join(","), [dates]);

  useEffect(() => {
    setHasInitialSnapshot(false);
  }, [officeId, datesKey]);

  useEffect(() => {
    datesRef.current = dates;
  }, [dates]);

  const perform = useCallback(
    (action: string, payload: Record<string, unknown> = {}) => {
      subscriptionRef.current?.perform(action, payload);
    },
    [],
  );

  const refreshSnapshot = useCallback(() => {
    if (datesRef.current.length === 0) {
      return;
    }

    perform("snapshot", {
      dates: datesRef.current,
    });
  }, [perform]);

  const selectDate = useCallback(
    (date: string) => {
      perform("select", { date });
    },
    [perform],
  );

  const deselectDate = useCallback(
    (date: string) => {
      perform("deselect", { date });
    },
    [perform],
  );

  const clearDates = useCallback(
    (dates: string[]) => {
      perform("clear", { dates });
    },
    [perform],
  );

  useEffect(() => {
    if (officeId === null) {
      subscriptionRef.current = null;
      return;
    }

    const subscribedOfficeId = officeId;

    const subscription = subscribeShared<OfficePlanningMessage>(
      {
        channel: "OfficePlanningChannel",
        office_id: subscribedOfficeId,
      },
      {
        connected() {
          setConnectionState({
            officeId: subscribedOfficeId,
            connected: true,
          });
        },

        disconnected() {
          setConnectionState({
            officeId: subscribedOfficeId,
            connected: false,
          });
        },

        rejected() {
          setConnectionState({
            officeId: subscribedOfficeId,
            connected: false,
          });
        },

        received(message: OfficePlanningMessage) {
          if (message.office_id !== subscribedOfficeId) {
            return;
          }

          switch (message.type) {
            case "planning.roster.updated":
              void queryClient.invalidateQueries({
                queryKey: generateOfficesUsersKey(message.office_id),
              });
              break;

            case "planning.snapshot":
              setPlanningState({
                officeId: subscribedOfficeId,
                dates: message.dates,
              });
              setHasInitialSnapshot(true);
              return;

            case "planning.date.updated":
              setPlanningState((current) => {
                const currentDates =
                  current?.officeId === subscribedOfficeId
                    ? current.dates
                    : EMPTY_PLANNING_DATES;

                return {
                  officeId: subscribedOfficeId,
                  dates: {
                    ...currentDates,
                    [message.date]: message.overrides,
                  },
                };
              });
              break;
          }
        },
      },
    );

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current === subscription) {
        subscriptionRef.current = null;
      }

      subscription.unsubscribe();
    };
  }, [officeId, queryClient]);

  const currentUserOverrides = useMemo<CurrentUserPlanningOverrideState>(() => {
    if (currentUserId === null) {
      return EMPTY_CURRENT_USER_OVERRIDES;
    }

    const selectedDates: string[] = [];
    const deselectedDates: string[] = [];

    Object.entries(planningStatesByDate).forEach(([date, overrides]) => {
      const isSelected = overrides.selected.some(
        (user) => user.id === currentUserId,
      );

      const isDeselected = overrides.deselected.some(
        (user) => user.id === currentUserId,
      );

      if (isSelected) {
        selectedDates.push(date);
      } else if (isDeselected) {
        deselectedDates.push(date);
      }
    });

    return {
      selectedDates,
      deselectedDates,
    };
  }, [planningStatesByDate, currentUserId]);

  const currentUserOverridesRef =
    useRef<CurrentUserPlanningOverrideState>(currentUserOverrides);

  useEffect(() => {
    currentUserOverridesRef.current = currentUserOverrides;
  }, [currentUserOverrides]);

  useEffect(() => {
    if (!isConnected || dates.length === 0) {
      return;
    }

    refreshSnapshot();
  }, [datesKey, isConnected, refreshSnapshot, dates.length]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const heartbeat = () => {
      const { selectedDates, deselectedDates } =
        currentUserOverridesRef.current;

      if (selectedDates.length === 0 && deselectedDates.length === 0) {
        return;
      }

      perform("heartbeat", {
        selected_dates: selectedDates,
        deselected_dates: deselectedDates,
      });
    };

    const intervalId = window.setInterval(heartbeat, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isConnected, perform]);

  return {
    planningStatesByDate,
    hasInitialSnapshot,
    isConnected,
    selectDate,
    deselectDate,
    clearDates,
    refreshSnapshot,
  };
}
