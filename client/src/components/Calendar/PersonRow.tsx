import CheckIcon from "@/components/icons/CheckIcon";
import XIcon from "@/components/icons/XIcon";
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
      <StatusMark status={status} />
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

function StatusMark({ status }: { status: AttendanceStatus }) {
  if (status === "confirmed") {
    return (
      <span className={`${statusMark} border-gray-900 text-gray-900`}>
        <CheckIcon className="h-2.5 w-2.5" />
      </span>
    );
  }

  if (status === "maybe") {
    return (
      <span className="h-4 w-4 shrink-0 rounded-full border border-dashed border-gray-400" />
    );
  }

  return (
    <span className={`${statusMark} border-gray-400 text-gray-400`}>
      <XIcon className="h-2.5 w-2.5" />
    </span>
  );
}

const statusMark =
  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border";
