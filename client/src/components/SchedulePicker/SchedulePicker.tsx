import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

import { useQueryClient } from "@tanstack/react-query";

import { heroImageFor } from "@/components/OfficePicker/heroImage";
import ScheduleDayItem from "@/components/ScheduleDayItem/ScheduleDayItem";
import type { CreateScheduleRequest } from "@/types/api/schedules";
import type { Office } from "@/types/api/offices";
import { WEEKDAYS } from "@/types/schedule/schedule";
import { createDefaultScheduleObjectPayload } from "@/util/api/functions/schedules";
import { useCreateDefaultScheduleMutation } from "@/util/api/mutations/schedules/createDefaultScheduleMutation";
import { generateCurrentUserKey } from "@/util/api/keys/userKeys";
import type { User } from "@/types/api/users";

export default function SchedulePicker() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createDefaultScheduleMutation = useCreateDefaultScheduleMutation();

  // The office is handed over from the office picker via router state. If a user
  // lands here directly, such as after a refresh, send them back to pick one.
  const office = (location.state as { office?: Office } | null)?.office;

  const [selectedDayIds, setSelectedDayIds] = useState<Set<string>>(new Set());

  if (!office) {
    return <Navigate to="/users/office" replace />;
  }

  const canSave = selectedDayIds.size > 0;

  const heroOfficeId = office.name.toLowerCase().trim().replaceAll(" ", "-");

  function toggleDay(dayId: string) {
    setSelectedDayIds((previousDayIds) => {
      const nextDayIds = new Set(previousDayIds);

      if (nextDayIds.has(dayId)) {
        nextDayIds.delete(dayId);
      } else {
        nextDayIds.add(dayId);
      }

      return nextDayIds;
    });
  }

  function handleSave() {
    if (!canSave) return;

    const payload: CreateScheduleRequest =
      createDefaultScheduleObjectPayload(selectedDayIds);

    createDefaultScheduleMutation.mutate(payload, {
      onSuccess: (schedule) => {
        queryClient.setQueryData(generateCurrentUserKey(), (user: User) =>
          user ? { ...user, default_schedule: schedule } : user,
        );
        navigate("/users/login");
      },
    });
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex w-full flex-col px-8 py-8 lg:w-[55%] lg:px-16">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 self-start text-sm font-semibold text-fg-subtle hover:text-fg"
        >
          <span aria-hidden="true">‹</span>
          Go back
        </button>

        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl leading-snug font-bold text-fg">
              What days are you usually in the{" "}
              <span className="text-fg-faint capitalize">{office.name}</span>{" "}
              office?
            </h1>

            <div className="mt-10">
              <p className="text-sm font-semibold text-fg">
                Pick your usual in-office days
              </p>

              <p className="mt-1 text-sm text-fg-subtle">
                This becomes your default each week, but you can always adjust
                it for a specific week later.
              </p>

              <div className="mt-5 grid grid-cols-5 gap-3">
                {WEEKDAYS.map((day) => (
                  <ScheduleDayItem
                    key={day.id}
                    day={day}
                    isSelected={selectedDayIds.has(day.id)}
                    onToggle={toggleDay}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || createDefaultScheduleMutation.isPending}
              className="mt-8 w-full rounded-full bg-fill py-3 text-sm font-semibold text-fg-inverse transition-colors hover:bg-fill-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createDefaultScheduleMutation.isPending
                ? "Saving..."
                : canSave
                  ? "Save schedule"
                  : "Skip for now"}
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative hidden overflow-hidden bg-surface-strong lg:block lg:w-[45%]"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImageFor(heroOfficeId)})`,
          }}
        />
      </div>
    </div>
  );
}
