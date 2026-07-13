import type { AttendanceStatus, PersonStatus } from "@/types/calendar/calendar";

interface PersonRowProps {
  person: PersonStatus;
  /** Display name of the logged-in user, highlighted in the list. */
  myName: string;
}

export function PersonRow({ person, myName }: PersonRowProps) {
  const { name, status } = person;
  const isMe = name === myName;

  return (
    <li className="flex items-center gap-2 px-4 py-1.5">
      <span
        className={`truncate text-sm ${nameClass(status)} ${
          isMe ? "font-medium" : ""
        }`}
        title={name}
      >
        {name}
      </span>
      {isMe && (
        <span className="shrink-0 text-xs font-medium text-gray-400">
          (you)
        </span>
      )}
    </li>
  );
}

function nameClass(status: AttendanceStatus): string {
  if (status === "confirmed") return "text-gray-900";
  if (status === "maybe") return "text-gray-500";
  return "text-gray-400 line-through";
}
