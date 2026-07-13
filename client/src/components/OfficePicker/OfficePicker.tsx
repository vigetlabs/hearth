import { useNavigate } from "react-router";
import { useState, type CSSProperties } from "react";

import { RadioGroup } from "radix-ui";

import { OFFICES } from "@/types/office/office";

import { DEFAULT_HERO_OFFICE_ID, heroImageFor } from "./heroImage";

import "./OfficePicker.css";

// The dedicated "fully remote" button below the grid stands in for the remote
// option, so the cards only cover the physical offices.
const OFFICE_CARDS = OFFICES.filter((office) => office.id !== "remote");

export default function OfficePicker() {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>("");
  // The image showing before the current selection, kept mounted so it can play
  // its exit animation. `null` means nothing has been picked yet (initial mount,
  // no transition to animate).
  const [previousOfficeId, setPreviousOfficeId] = useState<string | null>(null);
  // Which way the pair slides: "left" when the new card sits left of the old.
  const [direction, setDirection] = useState<"left" | "right">("right");

  const navigate = useNavigate();

  function handleSelectOffice(newOfficeId: string) {
    // Compare grid positions (OFFICE_CARDS order == left-to-right order) to pick
    // the slide direction. Fall back to the default hero's slot when nothing was
    // selected yet, since that's the image currently on screen.
    const oldOfficeId = selectedOfficeId || DEFAULT_HERO_OFFICE_ID;
    const oldIndex = OFFICE_CARDS.findIndex((o) => o.id === oldOfficeId);
    const newIndex = OFFICE_CARDS.findIndex((o) => o.id === newOfficeId);

    setDirection(newIndex < oldIndex ? "left" : "right");
    setPreviousOfficeId(selectedOfficeId);
    setSelectedOfficeId(newOfficeId);
  }

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

  // Only play the crossfade when the hero image actually changes. Picking Falls
  // Church from the initial (unselected) state is a real selection change but
  // resolves to the same default hero, so it should swap silently.
  const shouldAnimate =
    previousOfficeId !== null &&
    heroImageFor(previousOfficeId) !== heroImageFor(selectedOfficeId);

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
              <span className="text-neutral-400">Hearth</span> shows you who's
              in your office every day, so you can time your visits right
            </h1>

            <RadioGroup.Root
              value={selectedOfficeId}
              onValueChange={handleSelectOffice}
              aria-label="Which office is your primary?"
              className="mt-10"
            >
              <p className="text-sm font-semibold text-fg-primary">
                What's your primary office?
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
        className="relative hidden overflow-hidden bg-neutral-200 lg:block lg:w-[45%]"
        aria-hidden="true"
      >
        {/*
          Outgoing layer: the image from before the latest pick, sliding off and
          fading out. Only rendered once a transition has happened. Keyed by the
          new selection so it remounts (and replays its animation) every switch.
        */}
        {shouldAnimate && (
          <div
            key={`prev-${selectedOfficeId}`}
            // Layers overhang the panel horizontally by more than the slide
            // distance (2rem), so the image always covers the full width as it
            // slides — its own edge never sweeps into view against the panel cut.
            className="office-hero office-hero--exit absolute inset-y-0 -inset-x-10 bg-cover bg-center"
            style={
              {
                backgroundImage: `url(${heroImageFor(previousOfficeId)})`,
                "--slide-sign": direction === "left" ? -1 : 1,
              } as CSSProperties
            }
          />
        )}

        {/*
          Incoming layer: the current selection. Slides in from the opposite side
          and fades up over the outgoing layer. Skips the enter animation on the
          very first render (no previous image to transition from).
        */}
        <div
          key={`curr-${selectedOfficeId}`}
          className={`office-hero absolute inset-y-0 -inset-x-10 bg-cover bg-center ${
            shouldAnimate ? "office-hero--enter" : ""
          }`}
          style={
            {
              backgroundImage: `url(${heroImageFor(selectedOfficeId)})`,
              "--slide-sign": direction === "left" ? -1 : 1,
            } as CSSProperties
          }
        />
      </div>

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
