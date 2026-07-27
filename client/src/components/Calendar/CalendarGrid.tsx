import { DayCell } from "@/components/Calendar/DayCell";
import type { Office } from "@/types/api/offices";
import type { User } from "@/types/api/users";
import type { Visit } from "@/types/api/visits";
import type {
  RosterUser,
  WeekSchedule,
} from "@/types/calendar/calendar";
import { isInOffice } from "@/types/calendar/calendar";
import {
  generateDateKey,
  isSameDay,
} from "@/util/dates/date";

const WEEKDAYS_PER_WEEK = 5;
const EMPTY_DAY: RosterUser[] = [];

interface CalendarGridProps {
  days: readonly Date[];
  attendance: WeekSchedule;
  office: Office;
  user: User;

  visitorCounts: readonly number[];
  hotSpotDays: ReadonlySet<number>;

  locked: boolean;
  onToggleDate: (dateKey: string) => void;

  currentUserExternalVisitsByDate: ReadonlyMap<
    string,
    Visit
  >;

  externalOfficeNamesByDate: ReadonlyMap<
    string,
    string
  >;

  externalOfficeEmojisByDate: ReadonlyMap<
    string,
    string
  >;
}

export default function CalendarGrid({
  days,
  attendance,
  office,
  user,
  visitorCounts,
  hotSpotDays,
  locked,
  onToggleDate,
  currentUserExternalVisitsByDate,
  externalOfficeNamesByDate,
  externalOfficeEmojisByDate,
}: CalendarGridProps) {
  const todayIndex = days.findIndex(
    (day) => isSameDay(day, new Date()),
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {todayIndex !== -1 && (
        <span
          data-tour="today-pill"
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg px-3 py-1 text-[0.625rem] font-semibold text-fg-inverse"
          style={{
            left: `${
              ((todayIndex + 0.5) /
                WEEKDAYS_PER_WEEK) *
              100
            }%`,
          }}
        >
          Today
        </span>
      )}

      <div
        className="grid min-h-0 flex-1 divide-x-2 divide-line overflow-hidden rounded-xl border-2 border-line"
        style={{
          gridTemplateColumns: `repeat(${WEEKDAYS_PER_WEEK}, minmax(0, 1fr))`,
          gridTemplateRows: "1fr",
        }}
      >
        {days.map((day, index) => {
          const dateKey =
            generateDateKey(day);

          const rosterUsers =
            attendance[dateKey] ??
            EMPTY_DAY;

          const externalVisit =
            currentUserExternalVisitsByDate.get(
              dateKey,
            );

          const isConfirmedElsewhere =
            externalVisit !== undefined;

          const isMine =
            !isConfirmedElsewhere &&
            rosterUsers.some(
              (rosterUser) =>
                rosterUser.userId ===
                  user.id &&
                isInOffice(
                  rosterUser.status,
                ),
            );

          return (
            <DayCell
              key={dateKey}
              date={day}
              officeId={office.id}
              rosterUsers={rosterUsers}
              myUserId={user.id}
              isMine={isMine}
              visitorCount={
                visitorCounts[index] ?? 0
              }
              isHotSpot={
                hotSpotDays.has(index) &&
                !isConfirmedElsewhere
              }
              locked={locked}
              onToggleMine={() =>
                onToggleDate(dateKey)
              }
              isConfirmedElsewhere={
                isConfirmedElsewhere
              }
              externalOfficeName={
                externalOfficeNamesByDate.get(
                  dateKey,
                )
              }
              externalOfficeEmoji={
                externalOfficeEmojisByDate.get(
                  dateKey,
                )
              }
              currentOfficeName={
                office.name
              }
            />
          );
        })}
      </div>
    </div>
  );
}
