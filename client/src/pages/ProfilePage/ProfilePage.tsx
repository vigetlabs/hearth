import { useEffect, useState } from "react";
import { Link, useBlocker } from "react-router";

import { useAuth } from "@/util/auth/useAuth";
import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";

const OFFICES = [
  { id: "boulder", name: "Boulder", emoji: "⛰️" },
  { id: "falls-church", name: "Falls Church", emoji: "🌸" },
  { id: "chattanooga", name: "Chattanooga", emoji: "🚂" },
  { id: "durham", name: "Durham", emoji: "🐂" },
  { id: "remote", name: "Remote", emoji: "🏡", remote: true },
] as const;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
type Weekday = (typeof WEEKDAYS)[number];

const DEFAULT_OFFICE = "boulder";
const DEFAULT_SCHEDULE: Record<Weekday, boolean> = {
  Mon: true,
  Tue: true,
  Wed: false,
  Thu: true,
  Fri: false,
};

interface FormSnapshot {
  name: string;
  email: string;
  selectedOffice: string;
  inOffice: Record<Weekday, boolean>;
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState(
    user ? `${user.first_name} ${user.last_name}` : "",
  );
  const [email, setEmail] = useState(user?.email ?? "");
  const [selectedOffice, setSelectedOffice] = useState<string>(DEFAULT_OFFICE);
  const [inOffice, setInOffice] =
    useState<Record<Weekday, boolean>>(DEFAULT_SCHEDULE);

  // Transient feedback shown next to the Save button after a save attempt.
  const [saveFeedback, setSaveFeedback] = useState<
    "saved" | "no-changes" | null
  >(null);

  // The last saved state; the form is "dirty" whenever the live values diverge
  // from this. Saving re-baselines it, clearing the dirty flag.
  const [savedSnapshot, setSavedSnapshot] = useState<FormSnapshot>({
    name: user ? `${user.first_name} ${user.last_name}` : "",
    email: user?.email ?? "",
    selectedOffice: DEFAULT_OFFICE,
    inOffice: DEFAULT_SCHEDULE,
  });

  const isDirty =
    name !== savedSnapshot.name ||
    email !== savedSnapshot.email ||
    selectedOffice !== savedSnapshot.selectedOffice ||
    WEEKDAYS.some((day) => inOffice[day] !== savedSnapshot.inOffice[day]);

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
      event.returnValue = "";
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

  function toggleDay(day: Weekday) {
    setInOffice((prev) => ({ ...prev, [day]: !prev[day] }));
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isDirty) {
      setSaveFeedback("no-changes");
      return;
    }

    // @TODO: Persist profile changes once an update endpoint exists.
    setSavedSnapshot({ name, email, selectedOffice, inOffice });
    setSaveFeedback("saved");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <form onSubmit={handleSave} className="mx-auto max-w-3xl px-6 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span aria-hidden="true">‹</span> Go back
        </Link>

        <h1 className="mt-2 mb-8 text-3xl font-bold text-gray-900">
          Profile &amp; Settings
        </h1>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-8">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Profile</h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-semibold text-gray-900"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-gray-900"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-500 focus:border-gray-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-8">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Default Office
            </h2>

            <div className="flex flex-wrap gap-4">
              {OFFICES.map((office) => {
                const isSelected = selectedOffice === office.id;
                const isRemote = "remote" in office && office.remote;

                return (
                  <button
                    key={office.id}
                    type="button"
                    onClick={() => setSelectedOffice(office.id)}
                    className={`flex h-28 w-32 flex-col items-center justify-center gap-3 rounded-xl border text-sm text-gray-900 transition-colors ${
                      isRemote ? "border-dashed" : "border-solid"
                    } ${
                      isSelected
                        ? "border-gray-400 bg-gray-100"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {office.emoji}
                    </span>
                    <span>{office.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-8">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Default Schedule
            </h2>

            <div className="flex flex-wrap gap-3">
              {WEEKDAYS.map((day) => {
                const isIn = inOffice[day];

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex h-20 w-24 flex-col items-center justify-center gap-1.5 rounded-xl border transition-colors ${
                      isIn
                        ? "border-gray-300 bg-gray-100"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm font-bold text-gray-900">
                      {day}
                    </span>
                    {isIn ? (
                      <span className="text-xs text-gray-600">✓ in office</span>
                    ) : (
                      <span className="text-xs text-gray-400">+ add</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-end gap-4">
          <span role="status" aria-live="polite" className="text-sm">
            {!isDirty && saveFeedback === "saved" && (
              <span className="text-green-600">✓ Changes saved</span>
            )}
            {!isDirty && saveFeedback === "no-changes" && (
              <span className="text-gray-500">No changes to save</span>
            )}
          </span>
          <button
            type="submit"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
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
