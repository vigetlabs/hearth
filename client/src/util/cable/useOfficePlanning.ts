import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Subscription } from "@rails/actioncable";

import type { User } from "@/types/api/users";

import { cable } from "./cable";

export type ChannelSerializedUser = Pick<
  User,
  "id" | "first_name" | "last_name" | "office_id"
>;

export interface OfficePlanningDateOverrides {
  selected: ChannelSerializedUser[];
  deselected: ChannelSerializedUser[];
}

export type OfficePlanningDates = Record<string, OfficePlanningDateOverrides>;

const EMPTY_PLANNING_DATES: OfficePlanningDates = {};

interface PlanningSnapshotMessage {
  type: "planning.snapshot";
  office_id: number;
  dates: OfficePlanningDates;
}

interface PlanningDateUpdatedMessage {
  type: "planning.date.updated";
  office_id: number;
  date: string;
  overrides: OfficePlanningDateOverrides;
}

type OfficePlanningMessage =
  PlanningSnapshotMessage | PlanningDateUpdatedMessage;

interface UseOfficePlanningOptions {
  officeId: number | null;
  currentUserId: number | null;
  dates: string[];
}

interface UseOfficePlanningResult {
  planningByDate: OfficePlanningDates;
  isConnected: boolean;
  selectDate: (date: string) => void;
  deselectDate: (date: string) => void;
  refreshSnapshot: () => void;
}

interface OfficePlanningState {
  officeId: number;
  dates: OfficePlanningDates;
}

interface ConnectionState {
  officeId: number;
  connected: boolean;
}

interface CurrentUserOverrides {
  selectedDates: string[];
  deselectedDates: string[];
}

const EMPTY_CURRENT_USER_OVERRIDES: CurrentUserOverrides = {
  selectedDates: [],
  deselectedDates: [],
};

export function useOfficePlanning({
  officeId,
  currentUserId,
  dates,
}: UseOfficePlanningOptions): UseOfficePlanningResult {
  const [planningState, setPlanningState] =
    useState<OfficePlanningState | null>(null);

  const [connectionState, setConnectionState] =
    useState<ConnectionState | null>(null);

  const planningByDate =
    officeId !== null && planningState?.officeId === officeId
      ? planningState.dates
      : EMPTY_PLANNING_DATES;

  const isConnected =
    officeId !== null &&
    connectionState?.officeId === officeId &&
    connectionState.connected;

  const subscriptionRef = useRef<Subscription | null>(null);
  const datesRef = useRef(dates);

  const datesKey = useMemo(() => [...dates].sort().join(","), [dates]);

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

  useEffect(() => {
    if (officeId === null) {
      subscriptionRef.current = null;
      return;
    }

    const subscribedOfficeId = officeId;

    const subscription = cable.subscriptions.create(
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

          subscription.perform("snapshot", {
            dates: datesRef.current,
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
            case "planning.snapshot":
              setPlanningState({
                officeId: subscribedOfficeId,
                dates: message.dates,
              });
              break;

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
  }, [officeId]);

  const currentUserOverrides = useMemo<CurrentUserOverrides>(() => {
    if (currentUserId === null) {
      return EMPTY_CURRENT_USER_OVERRIDES;
    }

    const selectedDates: string[] = [];
    const deselectedDates: string[] = [];

    Object.entries(planningByDate).forEach(([date, overrides]) => {
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
  }, [planningByDate, currentUserId]);

  const currentUserOverridesRef =
    useRef<CurrentUserOverrides>(currentUserOverrides);

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
    planningByDate,
    isConnected,
    selectDate,
    deselectDate,
    refreshSnapshot,
  };
}
