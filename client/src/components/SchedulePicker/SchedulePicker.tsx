import { Navigate, useLocation, useNavigate } from "react-router";
import { useState } from "react";

import { WEEKDAYS } from "@/types/schedule/schedule";
import type { Office } from "@/types/office/office";

export default function SchedulePicker() {
  const location = useLocation();
  const navigate = useNavigate();

  // The office is handed over from the office picker via router state. If a user
  // lands here directly (e.g. a refresh), send them back to pick one first.
  const office = (location.state as { office?: Office } | null)?.office;

  const [selectedDayIds, setSelectedDayIds] = useState<Set<string>>(new Set());

  if (!office) {
    return <Navigate to="/users/office" replace />;
  }

  const canSave = selectedDayIds.size > 0;

  function toggleDay(dayId: string) {
    setSelectedDayIds((previous) => {
      const next = new Set(previous);
      if (next.has(dayId)) {
        next.delete(dayId);
      } else {
        next.add(dayId);
      }
      return next;
    });
  }

  function handleSave() {
    if (!canSave) return;

    // @TODO: Persist the selected default schedule to the API, then advance the
    // signup flow.
    navigate("/users/login");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6 pt-32">
      <h1 className="text-center text-4xl font-bold text-fg-primary">
        What days are you usually in the {office.name} office?
      </h1>
      <p className="mt-4 text-center text-lg text-neutral-500">
        This becomes your default each week, and you can always adjust it for a
        specific week later.
      </p>

      <div className="mt-14 flex flex-wrap justify-center gap-4">
        {WEEKDAYS.map((day) => {
          const isSelected = selectedDayIds.has(day.id);

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => toggleDay(day.id)}
              aria-pressed={isSelected}
              className={`flex h-24 w-28 flex-col items-center justify-center gap-1 rounded-2xl border text-fg-primary transition-colors hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none ${
                isSelected
                  ? "border-neutral-500 bg-neutral-100"
                  : "border-neutral-200"
              }`}
            >
              <span className="text-lg font-bold">{day.label}</span>
              <span className="text-sm text-neutral-500">
                {isSelected ? "✓ in office" : "+ add"}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="mt-12 w-full rounded-full bg-neutral-500 py-4 text-lg font-semibold text-white transition-colors enabled:hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Save schedule
      </button>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-6 flex items-center gap-1 font-semibold text-neutral-500 hover:text-fg-primary"
      >
        <span aria-hidden="true">‹</span> Go back
      </button>
    </div>
  );
}
