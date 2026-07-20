import type { Subscription } from "@rails/actioncable";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { cable } from "../cable";
import type { AttendanceWeekConfirmedMessage } from "@/types/cable/officeAttendance";
import { generateAttendanceConfirmationKey } from "@/util/api/keys/attendanceConfirmationsKeys";
import { generateVisitsKey } from "@/util/api/keys/visitKeys";

interface UseOfficeAttendingOptions {
  officeId: number | null;
}

interface UseOfficeAttendingResult {
  isConnected: boolean;
}

interface ConnectionState {
  officeId: number;
  connected: boolean;
}

export function useOfficeAttending({
  officeId,
}: UseOfficeAttendingOptions): UseOfficeAttendingResult {
  const queryClient = useQueryClient();

  const [connectionState, setConnectionState] =
    useState<ConnectionState | null>(null);

  const subscriptionRef = useRef<Subscription | null>(null);

  const isConnected =
    officeId !== null &&
    connectionState?.officeId === officeId &&
    connectionState.connected;

  useEffect(() => {
    if (officeId === null) {
      return;
    }

    const subscribedOfficeId = officeId;

    const subscription = cable.subscriptions.create(
      {
        channel: "OfficeAttendanceChannel",
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

        received(msg: AttendanceWeekConfirmedMessage) {
          if (msg.office_id !== subscribedOfficeId) {
            return;
          }

          switch (msg.type) {
            case "attendance.week.confirmed":
              console.log("invalidating");
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

  return { isConnected };
}
