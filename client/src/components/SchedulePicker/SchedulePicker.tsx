import { Navigate, useLocation, useNavigate } from "react-router";
import { useState } from "react";

import ScheduleDayItem from "@/components/ScheduleDayItem/ScheduleDayItem";
import { WEEKDAYS } from "@/types/schedule/schedule";
import type { Office } from "@/types/office/office";
import { heroImageFor } from "@/components/OfficePicker/heroImage";
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
    <div className="flex h-screen overflow-hidden">
      <div className="flex w-full flex-col px-8 py-8 lg:w-[55%] lg:px-16">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 self-start text-sm font-semibold text-neutral-500 hover:text-fg-primary"
        >
          <span aria-hidden="true">‹</span> Go back
        </button>

        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl leading-snug font-bold text-fg-primary">
              What days are you usually in the{" "}
              <span className="text-neutral-400">{office.name}</span> office?
            </h1>

            <div className="mt-10">
              <p className="text-sm font-semibold text-fg-primary">
                Pick your usual in-office days
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                This becomes your default each week, but you can always adjust
                it for a specific week later.
              </p>

              <div className="mt-5 grid grid-cols-5 gap-3">
                {WEEKDAYS.map((day) => {
                  const isSelected = selectedDayIds.has(day.id);

                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      aria-pressed={isSelected}
                      className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center text-fg-primary transition-colors hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none ${
                        isSelected
                          ? "border-neutral-500 bg-neutral-100"
                          : "border-neutral-200"
                      }`}
                    >
                      <span className="text-sm font-bold">{day.label}</span>
                      <span
                        className="text-xs text-neutral-500"
                        aria-hidden="true"
                      >
                        {isSelected ? "✓" : "+"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="mt-8 w-full rounded-full bg-neutral-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-600"
            >
              {selectedDayIds.size > 0 ? "Save schedule" : "Skip for now"}
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative hidden overflow-hidden bg-neutral-200 lg:block lg:w-[45%]"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImageFor(office.id)})` }}
        />
      </div>
    </div>
  );
}
