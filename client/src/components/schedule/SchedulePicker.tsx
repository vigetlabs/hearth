import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { useQueryClient } from "@tanstack/react-query";

import { heroImageFor } from "@/components/office/OfficePicker/heroImage";
import HeroLayer from "@/components/landing/Hero/HeroLayer";
import HeroPanel from "@/components/landing/Hero/HeroPanel";
import CornerGlow from "@/components/decorative/CornerGlow";
import ScheduleDayItem from "@/components/schedule/ScheduleDayItem";
import type { CreateScheduleRequest } from "@/types/api/schedules";
import type { Office } from "@/types/api/offices";
import { WEEKDAYS } from "@/types/schedule/schedule";
import { createDefaultScheduleObjectPayload } from "@/util/api/functions/schedules";
import { useCreateDefaultScheduleMutation } from "@/util/api/mutations/schedules/createDefaultScheduleMutation";
import { generateCurrentUserKey } from "@/util/api/keys/userKeys";
import type { User } from "@/types/api/users";
import { useAuth } from "@/hooks/contexts/useAuth";

export default function SchedulePicker() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createDefaultScheduleMutation = useCreateDefaultScheduleMutation();

  // The office is handed over from the office picker via router state. If a user
  // lands here directly by sso redirect, read their current office
  const officeLocation: Office = (location.state as { office?: Office } | null)
    ?.office;

  const { user } = useAuth();

  const officeName: string = officeLocation?.name ?? user?.office?.name;
  const [selectedDayIds, setSelectedDayIds] = useState<Set<string>>(new Set());

  const canSave = selectedDayIds.size > 0;

  const heroOfficeId = officeName?.toLowerCase().trim().replaceAll(" ", "-");

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
        navigate("/calendar", { replace: true });
      },
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <div className="relative flex w-full flex-col px-8 py-8 lg:w-[50%] lg:px-16">
        <CornerGlow />

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="relative z-10 flex items-center gap-1 self-start text-sm font-bold text-fg-subtle transition-colors hover:text-black"
        >
          <span aria-hidden="true">‹</span>
          Go back
        </button>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-12">
          <div className="w-full max-w-[90%]">
            <h1 className="text-2xl leading-snug font-bold text-fg">
              What days are you usually in the{" "}
              <span className="text-strong capitalize">{officeName}</span>{" "}
              office?
            </h1>

            <div className="mt-10">
              <p className="mt-1 text-sm text-fg">
                <span className="font-bold">This is your weekly default.</span>{" "}
                You can adjust it anytime.
              </p>

              <div className="mt-5 grid grid-cols-5 gap-3">
                {WEEKDAYS.map((day) => (
                  <ScheduleDayItem
                    key={day.id}
                    day={day}
                    isSelected={selectedDayIds.has(day.id)}
                    onToggle={toggleDay}
                    className="aspect-[3/2]"
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || createDefaultScheduleMutation.isPending}
              className="mt-8 w-full rounded-full py-3 text-sm font-semibold text-fg-inverse transition-colors enabled:bg-strong enabled:hover:bg-strong-hover disabled:cursor-not-allowed disabled:bg-surface-muted"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      <HeroPanel>
        <HeroLayer src={heroImageFor(heroOfficeId)} />
      </HeroPanel>
    </div>
  );
}
