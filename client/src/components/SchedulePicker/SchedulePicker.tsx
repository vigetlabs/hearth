import { Navigate, useLocation, useNavigate } from "react-router";
import { useState } from "react";

import ScheduleDayItem from "@/components/ScheduleDayItem/ScheduleDayItem";
import { WEEKDAYS } from "@/types/schedule/schedule";
import type { Office } from "@/types/office/office";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateDefaultScheduleMutation } from "@/util/api/mutations/schedules/createDefaultScheduleMutation";
import type { CreateScheduleRequest } from "@/types/api/schedules";
import { createDefaultScheduleObjectPayload } from "@/util/api/functions/schedules";
import { generateCurrentUserDefaultScheduleKey } from "@/util/api/keys/scheduleKeys";

export default function SchedulePicker() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createDefaultScheduleMutation = useCreateDefaultScheduleMutation();

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

    const payload: CreateScheduleRequest =
      createDefaultScheduleObjectPayload(selectedDayIds);
    console.log(payload);

    createDefaultScheduleMutation.mutate(payload, {
      onSuccess: (schedule) => {
        queryClient.setQueryData(
          generateCurrentUserDefaultScheduleKey(),
          schedule,
        );
      },
    });

    // @TODO: Persist the selected default schedule to the API.
    navigate("/users/login");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6 pt-32">
      <h1 className="text-center text-4xl font-bold text-fg-primary">
        What days are you usually in the
        <span className="capitalize"> {office.name} </span>
        office?
      </h1>

      <p className="mt-4 text-center text-lg text-neutral-500">
        This becomes your default each week, and you can always adjust it for a
        specific week later.
      </p>

      <div className="mt-14 flex flex-wrap justify-center gap-4">
        {WEEKDAYS.map((day) => (
          <ScheduleDayItem
            key={day.id}
            day={day}
            isSelected={selectedDayIds.has(day.id)}
            onToggle={toggleDay}
          />
        ))}
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
        <span aria-hidden="true">‹</span>
        Go back
      </button>
    </div>
  );
}
