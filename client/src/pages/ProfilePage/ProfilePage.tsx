import { useEffect, useState } from "react";
import { Link, useBlocker } from "react-router";

import { useAuth } from "@/util/auth/useAuth";
import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import LockIcon from "@/components/icons/LockIcon";
import OfficeOptions from "@/components/OfficeOptions/OfficeOptions";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";
import { useUpdateUserMutation } from "@/util/api/mutations/users/updateUserMutation";
import type { PatchUserRequest } from "@/types/api/users";
import { createUpdateUserObjectPayload } from "@/util/api/functions/users";
import { generateCurrentUserKey } from "@/util/api/keys/userKeys";
import { useQueryClient } from "@tanstack/react-query";
import type { Schedule } from "@/types/api/schedules";
import { WEEKDAYS } from "@/types/schedule/schedule";
import ScheduleDayItem from "@/components/ScheduleDayItem/ScheduleDayItem";
import { buildScheduleAttributes } from "@/util/api/functions/schedules";
import { cn } from "@/util/cn";

interface FormSnapshot {
  firstName: string;
  lastName: string;
  selectedOfficeId: string;
  selectedDayIds: Set<string>;
}

function getSelectedDayIds(schedule: Schedule): Set<string> {
  return new Set(
    WEEKDAYS.filter((day) => schedule[day.id as keyof Schedule] === true).map(
      (day) => day.id,
    ),
  );
}

function areDaySetsEqual(first: Set<string>, second: Set<string>) {
  if (first.size !== second.size) {
    return false;
  }
  return [...first].every((value) => second.has(value));
}

const sectionClassName =
  "flex flex-1 flex-col justify-center rounded-3xl bg-surface px-14 py-4 shadow-card";

const officeItemClassName = "min-w-32 aspect-[3/2]";

export default function ProfilePage() {
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const officesQuery = useOfficesQuery();
  const offices = officesQuery.data ?? [];

  const updateUserMutation = useUpdateUserMutation();

  const initialSelectedDayIds: Set<string> = user?.default_schedule
    ? getSelectedDayIds(user.default_schedule)
    : new Set<string>();

  const [firstName, setFirstName] = useState<string>(
    user ? `${user.first_name}` : "",
  );
  const [lastName, setLastName] = useState<string>(
    user ? `${user.last_name}` : "",
  );

  const email = user?.email ?? "";

  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(
    user ? String(user.office_id) : "",
  );

  const selectedOffice = offices.find(
    (office) => String(office.id) === selectedOfficeId,
  );
  const isRemoteSelected = selectedOffice?.name.toLowerCase() === "remote";

  const [selectedDayIds, setSelectedDayIds] = useState<Set<string>>(
    initialSelectedDayIds,
  );

  const [saveFeedback, setSaveFeedback] = useState<
    "saved" | "no-changes" | null
  >(null);

  const [savedSnapshot, setSavedSnapshot] = useState<FormSnapshot>({
    firstName: firstName,
    lastName: lastName,
    selectedOfficeId: selectedOfficeId,
    selectedDayIds: new Set(initialSelectedDayIds),
  });

  const isDirty =
    firstName !== savedSnapshot.firstName ||
    lastName !== savedSnapshot.lastName ||
    selectedOfficeId !== savedSnapshot.selectedOfficeId ||
    !areDaySetsEqual(selectedDayIds, savedSnapshot.selectedDayIds);

  // Intercept in-app navigation (Go back, the logo, the header menu) while there
  // are unsaved changes so we can confirm before leaving.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  // Hard navigations (refresh, tab close, typing a URL) can't be shown a custom
  // modal, so fall back to the browser's native confirmation prompt.
  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Auto-dismiss the save feedback after a few seconds. It's also hidden the
  // moment the form becomes dirty again (see the render below), so stale
  // feedback never lingers once the user starts editing.
  useEffect(() => {
    if (!saveFeedback) {
      return;
    }

    const timer = setTimeout(() => setSaveFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [saveFeedback]);

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

  function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isDirty) {
      setSaveFeedback("no-changes");
      return;
    }

    const payload: PatchUserRequest = createUpdateUserObjectPayload(
      firstName,
      lastName,
      Number(selectedOfficeId),
      buildScheduleAttributes(selectedDayIds),
    );

    updateUserMutation.mutate(payload, {
      onSuccess: async (updatedUser) => {
        queryClient.setQueryData(generateCurrentUserKey(), updatedUser);
        setSavedSnapshot({
          firstName,
          lastName,
          selectedOfficeId,
          selectedDayIds,
        });
        setSaveFeedback("saved");
      },
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-muted">
      <form
        onSubmit={handleSave}
        className="mx-auto flex min-h-0 w-full max-w-[780px] flex-1 flex-col px-6 py-6"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-fg-subtle hover:text-fg-strong"
        >
          <span aria-hidden="true">‹</span> Go back
        </Link>

        <h1 className="mt-1 mb-3 text-xl font-bold text-fg">
          Profile &amp; Settings
        </h1>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <section className={sectionClassName}>
            <h2 className="mb-1 text-base font-bold text-fg">Profile</h2>

            <div className="space-y-3">
              <div className="flex flex-row gap-5 w-full">
                <div className="flex flex-col flex-1">
                  <label
                    htmlFor="firstName"
                    className="mb-1.5 block text-sm font-semibold text-fg"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-line-strong px-4 py-1.5 text-fg focus:border-fill focus:outline-none"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <label
                    htmlFor="lastName"
                    className="mb-1.5 block text-sm font-semibold text-fg"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-line-strong px-4 py-1.5 text-fg focus:border-fill focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-fg"
                >
                  Email
                  <LockIcon className="h-3.5 w-3.5 text-fg-faint" />
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  aria-describedby="email-help"
                  className="w-full cursor-not-allowed rounded-lg border border-line bg-surface-muted px-4 py-1.5 text-fg-subtle focus:outline-none"
                />
                <p id="email-help" className="mt-1.5 text-xs text-fg-subtle">
                  Your email is managed through your Google account and can't be
                  changed.
                </p>
              </div>
            </div>
          </section>

          <section className={sectionClassName}>
            <h2 className="mb-1 text-base font-bold text-fg">Default Office</h2>
            <p className="mb-3 text-xs text-fg-subtle">
              Remote means no home office. Use the Remote View to browse offices
              when you plan to visit one.
            </p>

            <div className="w-full">
              <OfficeOptions
                offices={offices}
                showRemoteOption={true}
                selectedOfficeId={selectedOfficeId}
                handleSelectOffice={setSelectedOfficeId}
                officeItemClassName={officeItemClassName}
                containerClassName="mt-0"
              />
            </div>
          </section>

          <section className={sectionClassName}>
            <h2 className="mb-1 text-base font-bold text-fg">
              Default Schedule
            </h2>
            <p className="mb-3 text-xs text-fg-subtle">
              These are your usual in-office days. They pre-fill each new week
              for you to review and confirm.
            </p>

            <div
              className={cn(
                "grid grid-cols-5 gap-3 transition-opacity",
                isRemoteSelected && "pointer-events-none opacity-50",
              )}
              aria-disabled={isRemoteSelected}
            >
              {WEEKDAYS.map((day) => (
                <ScheduleDayItem
                  key={day.id}
                  day={day}
                  isSelected={selectedDayIds.has(day.id)}
                  onToggle={toggleDay}
                  disabled={isRemoteSelected}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 flex items-center justify-end gap-4">
          <span role="status" aria-live="polite" className="text-sm">
            {!isDirty && saveFeedback === "saved" && (
              <span className="text-success">✓ Changes saved</span>
            )}
            {!isDirty && saveFeedback === "no-changes" && (
              <span className="text-fg-subtle">No changes to save</span>
            )}
          </span>
          <button
            type="submit"
            className="rounded-lg bg-surface px-10 py-1 text-base font-semibold text-fg shadow-card hover:bg-surface-sunken"
          >
            Save Changes
          </button>
        </div>
      </form>

      <ConfirmationModal
        open={blocker.state === "blocked"}
        title="Discard unsaved changes?"
        description="You have unsaved changes to your profile. If you leave now, they'll be lost."
        confirmLabel="Leave without saving"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
