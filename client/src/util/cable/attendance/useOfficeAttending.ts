import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { OfficeAttendanceMessage } from "@/types/cable/officeAttendance";
import {
  subscribeShared,
  type SharedSubscription,
} from "../sharedSubscription";
import { generateAttendanceConfirmationKey } from "@/util/api/keys/attendanceConfirmationsKeys";
import { generateVisitsKey } from "@/util/api/keys/visitKeys";
import { generateCurrentUserVisitsKey } from "@/util/api/keys/userKeys";

interface UseOfficeAttendingOptions {
  officeId: number | null;
  weekStart: string;
  currentUserId: number | null;
}

interface UseOfficeAttendingResult {
  isConnected: boolean;
  editingUserIds: ReadonlySet<number>;
  startEditing: () => void;
  refreshEditingSnapshot: () => void;
}

interface ConnectionState {
  officeId: number;
  weekStart: string;
  connected: boolean;
}

interface EditingUsersState {
  officeId: number;
  weekStart: string;
  userIds: ReadonlySet<number>;
}

const EMPTY_EDITING_USER_IDS: ReadonlySet<number> = new Set();

export function useOfficeAttending({
  officeId,
  weekStart,
  currentUserId,
}: UseOfficeAttendingOptions): UseOfficeAttendingResult {
  const queryClient = useQueryClient();

  const [connectionState, setConnectionState] =
    useState<ConnectionState | null>(null);

  const [editingUsersState, setEditingUsersState] =
    useState<EditingUsersState | null>(null);

  const editingUserIds =
    officeId !== null &&
    editingUsersState?.officeId === officeId &&
    editingUsersState.weekStart === weekStart
      ? editingUsersState.userIds
      : EMPTY_EDITING_USER_IDS;

  const subscriptionRef = useRef<SharedSubscription | null>(null);

  const isConnected =
    officeId !== null &&
    connectionState?.officeId === officeId &&
    connectionState.weekStart === weekStart &&
    connectionState.connected;

  const refreshEditingSnapshot = useCallback(() => {
    subscriptionRef.current?.perform("snapshot", {
      week_start: weekStart,
    });
  }, [weekStart]);

  const startEditing = useCallback(() => {
    if (currentUserId === null || officeId === null || !isConnected) {
      return;
    }

    setEditingUsersState((current) => {
      const currentUserIds =
        current?.officeId === officeId && current.weekStart === weekStart
          ? current.userIds
          : EMPTY_EDITING_USER_IDS;

      const next = new Set(currentUserIds);
      next.add(currentUserId);

      return {
        officeId,
        weekStart,
        userIds: next,
      };
    });

    subscriptionRef.current?.perform("start_editing", {
      week_start: weekStart,
    });
  }, [currentUserId, isConnected, officeId, weekStart]);

  useEffect(() => {
    if (officeId === null) {
      return;
    }

    const subscribedOfficeId = officeId;
    const subscribedWeekStart = weekStart;

    const subscription = subscribeShared<OfficeAttendanceMessage>(
      {
        channel: "OfficeAttendanceChannel",
        office_id: subscribedOfficeId,
      },
      {
        connected() {
          setConnectionState({
            officeId: subscribedOfficeId,
            weekStart: subscribedWeekStart,
            connected: true,
          });

          subscription.perform("snapshot", {
            week_start: subscribedWeekStart,
          });
        },

        disconnected() {
          setConnectionState({
            officeId: subscribedOfficeId,
            weekStart: subscribedWeekStart,
            connected: false,
          });
        },

        rejected() {
          setConnectionState({
            officeId: subscribedOfficeId,
            weekStart: subscribedWeekStart,
            connected: false,
          });
        },

        received(msg: OfficeAttendanceMessage) {
          if (msg.office_id !== subscribedOfficeId) {
            return;
          }

          switch (msg.type) {
            case "attendance.editing.updated": {
              if (msg.week_start !== subscribedWeekStart) {
                return;
              }

              setEditingUsersState({
                officeId: subscribedOfficeId,
                weekStart: msg.week_start,
                userIds: new Set(msg.editing_user_ids),
              });
              return;
            }

            case "attendance.week.confirmed": {
              void Promise.all([
                queryClient.invalidateQueries({
                  queryKey: generateAttendanceConfirmationKey(
                    msg.office_id,
                    msg.starts_on,
                  ),
                }),
                queryClient.invalidateQueries({
                  queryKey: generateVisitsKey({
                    date: msg.starts_on,
                    view: "week",
                    office_id: msg.office_id,
                  }),
                }),
              ]);

              return;
            }

            case "attendance.visits.removed": {
              const invalidations = [
                queryClient.invalidateQueries({
                  queryKey: generateAttendanceConfirmationKey(
                    msg.office_id,
                    msg.week_start,
                  ),
                }),
                queryClient.invalidateQueries({
                  queryKey: generateVisitsKey({
                    date: msg.week_start,
                    view: "week",
                    office_id: msg.office_id,
                  }),
                }),
              ];

              if (msg.user_id === currentUserId) {
                invalidations.push(
                  queryClient.invalidateQueries({
                    queryKey: generateCurrentUserVisitsKey(
                      msg.week_start,
                      "week",
                    ),
                  }),
                );
              }

              void Promise.all(invalidations);

              return;
            }

            default: {
              const exhaustiveCheck: never = msg;
              return exhaustiveCheck;
            }
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
  }, [currentUserId, officeId, weekStart, queryClient]);

  const isCurrentUserEditing =
    currentUserId !== null && editingUserIds.has(currentUserId);

  useEffect(() => {
    if (!isConnected || !isCurrentUserEditing) {
      return;
    }

    const heartbeatId = window.setInterval(() => {
      subscriptionRef.current?.perform("heartbeat", {
        week_start: weekStart,
      });
    }, 30_000);

    return () => {
      window.clearInterval(heartbeatId);
    };
  }, [isConnected, isCurrentUserEditing, weekStart]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const intervalId = window.setInterval(() => {
      refreshEditingSnapshot();
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isConnected, refreshEditingSnapshot]);

  return {
    editingUserIds,
    isConnected,
    startEditing,
    refreshEditingSnapshot,
  };
}
