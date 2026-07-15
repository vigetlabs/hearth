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

export default function ProfilePage() {
  const officeItemClassName = cn("min-w-32");

  const { user } = useAuth();

  const queryClient = useQueryClient();

  const officesQuery = useOfficesQuery();
  const offices = officesQuery.data ?? [];

  const updateUserMutation = useUpdateUserMutation();

  const initialSelectedDayIds: Set<string> = user.default_schedule
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
    String(user.office_id),
  );

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
    <div className="min-h-screen bg-surface-muted">
      <form onSubmit={handleSave} className="mx-auto max-w-3xl px-6 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-fg-subtle hover:text-fg-strong"
        >
          <span aria-hidden="true">‹</span> Go back
        </Link>

        <h1 className="mt-2 mb-8 text-3xl font-bold text-fg">
          Profile &amp; Settings
        </h1>

        <div className="space-y-6">
          <section className="rounded-2xl bg-surface p-8">
            <h2 className="mb-6 text-xl font-bold text-fg">Profile</h2>

            <div className="space-y-5">
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
                    className="w-full rounded-lg border border-line-strong px-4 py-2.5 text-fg focus:border-fill focus:outline-none"
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
                    className="w-full rounded-lg border border-line-strong px-4 py-2.5 text-fg focus:border-fill focus:outline-none"
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
                  className="w-full cursor-not-allowed rounded-lg border border-line bg-surface-muted px-4 py-2.5 text-fg-subtle focus:outline-none"
                />
                <p id="email-help" className="mt-1.5 text-xs text-fg-subtle">
                  Your email is managed through your Google account and can't be
                  changed.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-surface p-8">
            <h2 className="mb-6 text-xl font-bold text-fg">Default Office</h2>

            <div className="flex flex-wrap gap-4">
              <OfficeOptions
                offices={offices}
                showRemoteOption={true}
                selectedOfficeId={selectedOfficeId}
                handleSelectOffice={setSelectedOfficeId}
                officeItemClassName={officeItemClassName}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-surface p-8">
            <h2 className="mb-6 text-xl font-bold text-fg">Default Schedule</h2>

            <div className="flex flex-wrap gap-3">
              {WEEKDAYS.map((day) => (
                <ScheduleDayItem
                  key={day.id}
                  day={day}
                  isSelected={selectedDayIds.has(day.id)}
                  onToggle={toggleDay}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-end gap-4">
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
            className="rounded-lg border border-line-strong bg-surface px-5 py-2.5 text-sm font-medium text-fg hover:bg-surface-sunken"
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
