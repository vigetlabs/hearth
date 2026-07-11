import { useNavigate } from "react-router";
import { useState } from "react";

import { RadioGroup } from "radix-ui";

import { OFFICES } from "@/types/office/office";

// The dedicated "fully remote" button below the grid stands in for the remote
// option, so the cards only cover the physical offices.
const OFFICE_CARDS = OFFICES.filter((office) => office.id !== "remote");

// Each office has a matching hero photo in `public/`. Shown before the user has
// picked an office, while no card is selected. A missing file degrades to the
// panel's placeholder background instead of breaking the build.
const DEFAULT_HERO_OFFICE_ID = "falls-church";

function heroImageFor(officeId: string) {
  const id = officeId || DEFAULT_HERO_OFFICE_ID;
  return `/images/office-signup/${id}-hero.png`;
}

export default function OfficePicker() {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>("");

  const navigate = useNavigate();

  function handleContinue() {
    if (!selectedOfficeId) return;

    // @TODO: Persist the selected default office to the API.
    const selectedOffice = OFFICES.find(
      (office) => office.id === selectedOfficeId,
    );

    // Advance to the schedule screen, passing the office along so it can tailor
    // its heading.
    navigate("/users/schedule", { state: { office: selectedOffice } });
  }

  function handleRemote() {
    // Remote users have no in-office days to pick, so skip the schedule screen
    // and drop them straight into the calendar.
    navigate("/calendar");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex w-full flex-col px-8 py-8 lg:w-1/2 lg:px-16">
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
              <span className="text-neutral-400">Hearth</span> shows you who's
              around in your primary office each day, so you can time your
              visits right
            </h1>

            <RadioGroup.Root
              value={selectedOfficeId}
              onValueChange={setSelectedOfficeId}
              aria-label="Which office is your primary?"
              className="mt-10"
            >
              <p className="text-sm font-semibold text-fg-primary">
                Which office is your primary?
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Pick the one you visit the most, even if you're mostly remote.
              </p>

              <div className="mt-5 grid grid-cols-4 gap-3">
                {OFFICE_CARDS.map((office) => (
                  <RadioGroup.Item
                    key={office.id}
                    value={office.id}
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 p-3 text-center text-fg-primary transition-colors hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none data-[state=checked]:border-neutral-500 data-[state=checked]:bg-neutral-100"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {office.emoji}
                    </span>
                    <span className="text-xs font-medium">{office.name}</span>
                  </RadioGroup.Item>
                ))}
              </div>
            </RadioGroup.Root>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedOfficeId}
              className="mt-8 w-full rounded-full bg-neutral-500 py-3 text-sm font-semibold text-white transition-colors enabled:hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue
            </button>

            <button
              type="button"
              onClick={handleRemote}
              className="mt-3 w-full rounded-full border border-neutral-300 py-3 text-sm font-semibold text-fg-primary transition-colors hover:border-neutral-400 hover:bg-neutral-50"
            >
              No home office. I'm fully remote.
            </button>
          </div>
        </div>
      </div>

      <div
        className="hidden bg-neutral-200 bg-cover bg-center lg:block lg:w-1/2"
        style={{ backgroundImage: `url(${heroImageFor(selectedOfficeId)})` }}
        aria-hidden="true"
      />

      {/*
        Preload every office hero on mount so switching selection swaps the panel
        instantly. The background-image above is only fetched the first time an
        office is picked; these hidden <img>s force that fetch + decode up front.
        display:none images are still loaded by the browser.
      */}
      <div className="hidden" aria-hidden="true">
        {OFFICE_CARDS.map((office) => (
          <img key={office.id} src={heroImageFor(office.id)} alt="" />
        ))}
      </div>
    </div>
  );
}
