import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { cable } from "./cable";
import type { Subscription } from "@rails/actioncable";
import type { User } from "@/types/api/users";

export type ChannelSerializedUser = Pick<
  User,
  "id" | "first_name" | "last_name" | "office_id"
>;

export type OfficePlanningDates = Record<string, ChannelSerializedUser[]>;

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
  users: ChannelSerializedUser[];
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

  // copy latest visible calendar dates into ref effect
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

    const datesPayload = { dates: datesRef.current };

    perform("snapshot", datesPayload);
  }, [perform]);

  const selectDate = useCallback(
    (date: string) => {
      const datePayload = { date: date };
      perform("select", datePayload);
    },
    [perform],
  );

  const deselectDate = useCallback(
    (date: string) => {
      const datePayload = { date: date };
      perform("deselect", datePayload);
    },
    [perform],
  );

  // create and clean up action cable effect
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

        received(msg: OfficePlanningMessage) {
          if (msg.office_id !== subscribedOfficeId) {
            return;
          }

          switch (msg.type) {
            case "planning.snapshot":
              setPlanningState({
                officeId: subscribedOfficeId,
                dates: msg.dates,
              });
              break;

            case "planning.date.updated":
              setPlanningState((current) => {
                const currentDates =
                  current?.officeId === subscribedOfficeId ? current.dates : {};

                return {
                  officeId: subscribedOfficeId,
                  dates: {
                    ...currentDates,
                    [msg.date]: msg.users,
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

  const selectedDates = useMemo(() => {
    if (currentUserId === null) {
      return [];
    }

    return Object.entries(planningByDate)
      .filter(([, users]) => users.some((user) => user.id === currentUserId))
      .map(([date]) => date);
  }, [planningByDate, currentUserId]);

  const selectedDatesRef = useRef(selectedDates);

  // copy latest current-user selections into ref effect
  useEffect(() => {
    selectedDatesRef.current = selectedDates;
  }, [selectedDates]);

  // refresh snapshot when visible dates change effect
  useEffect(() => {
    if (!isConnected || dates.length === 0) {
      return;
    }

    refreshSnapshot();
  }, [datesKey, isConnected, refreshSnapshot, dates.length]);

  // start & stop heartbeat effect
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const heartbeat = () => {
      const datesToRenew = selectedDatesRef.current;

      if (datesToRenew.length === 0) {
        return;
      }

      const datesPayload = { dates: datesToRenew };
      perform("heartbeat", datesPayload);
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
