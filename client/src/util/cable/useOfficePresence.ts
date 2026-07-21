import { useEffect, useState } from "react";
import { subscribeShared } from "./sharedSubscription";
import type { User } from "@/types/api/users";

interface PresenceSnapshot {
  type: "presence.snapshot";
  office_id: number;
  users: User[];
}

export function useOfficePresence(officeId: number | undefined): User[] {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (officeId === undefined) {
      return;
    }

    const subscription = subscribeShared<PresenceSnapshot>(
      {
        channel: "OfficePresenceChannel",
        office_id: officeId,
      },
      {
        connected() {
          console.info(`Connected to office presence for office ${officeId}`);
        },
        disconnected() {
          console.info(
            `Disconnected from office presence for office ${officeId}`,
          );
        },
        rejected() {
          console.error(
            `Office presence subscription rejected for office ${officeId}`,
          );

          setUsers([]);
        },

        received(event: PresenceSnapshot) {
          if (
            event.type === "presence.snapshot" &&
            event.office_id === officeId
          ) {
            setUsers(event.users);
          }
        },
      },
    );

    const heartbeatId = window.setInterval(() => {
      subscription.perform("heartbeat");
    }, 30_000);

    return () => {
      window.clearInterval(heartbeatId);
      subscription.unsubscribe();
      setUsers([]);
    };
  }, [officeId]);

  return users;
}
