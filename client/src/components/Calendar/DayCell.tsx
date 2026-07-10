import CheckIcon from "@/components/icons/CheckIcon";
import PersonIcon from "@/components/icons/PersonIcon";
import PlusIcon from "@/components/icons/PlusIcon";

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });

interface DayCellProps {
  date: Date;
  names: string[];
  /** Display name of the logged-in user, highlighted in the list. */
  myName: string;
  /** Whether the logged-in user is in the office on this day. */
  isMine: boolean;
  /** Toggle the logged-in user in/out of the office for this day. */
  onToggleMine: () => void;
}

export function DayCell({
  date,
  names,
  myName,
  isMine,
  onToggleMine,
}: DayCellProps) {
  return (
    <div className="flex min-h-[26rem] flex-col">
      <div
        className={`flex items-start justify-between px-4 py-3 ${
          isMine ? "bg-gray-100" : "bg-white"
        }`}
      >
        <div>
          <div className="text-lg font-bold text-gray-900">
            {weekdayFormat.format(date)}
          </div>
          <div className="text-sm text-gray-500">{date.getDate()}</div>
        </div>

        <button
          type="button"
          onClick={onToggleMine}
          disabled={!myName}
          aria-pressed={isMine}
          aria-label={
            isMine ? "You're in the office — remove yourself" : "Add yourself"
          }
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isMine ? (
            <CheckIcon className="h-3.5 w-3.5" />
          ) : (
            <PlusIcon className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <ul className="flex flex-col gap-3 px-4 py-4">
        {names.map((name, i) => {
          const isMe = name === myName;
          return (
            <li key={`${name}-${i}`} className="flex items-center gap-2">
              <Avatar highlighted={isMe} />
              <span
                className={`truncate text-sm ${
                  isMe ? "font-medium text-gray-900" : "text-gray-700"
                }`}
                title={name}
              >
                {name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Avatar({ highlighted }: { highlighted: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
        highlighted
          ? "bg-purple-200 text-purple-600"
          : "bg-gray-200 text-gray-400"
      }`}
    >
      <PersonIcon className="h-3.5 w-3.5" />
    </span>
  );
}
