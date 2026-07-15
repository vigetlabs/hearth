import { useNavigate } from "react-router";
import { useState, type CSSProperties } from "react";

import { useQueryClient } from "@tanstack/react-query";
import type { Office } from "@/types/api/offices";
import type { PatchUserRequest } from "@/types/api/users";
import { createUpdateUserObjectPayload } from "@/util/api/functions/users";
import { generateCurrentUserKey } from "@/util/api/keys/userKeys";
import { useUpdateUserMutation } from "@/util/api/mutations/users/updateUserMutation";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";
import { cn } from "@/util/cn";

import { DEFAULT_HERO_OFFICE_ID, heroImageFor } from "./heroImage";

import "./OfficePicker.css";
import OfficeOptions from "@/components/OfficeOptions/OfficeOptions";

export default function OfficePicker() {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>("");

  // The image showing before the current selection, kept mounted so it can play
  // its exit animation. `null` means nothing has been picked yet (initial mount,
  // no transition to animate).
  const [previousOfficeId, setPreviousOfficeId] = useState<string | null>(null);

  // Which way the pair slides: "left" when the new card sits left of the old.
  const [direction, setDirection] = useState<"left" | "right">("right");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const officesQuery = useOfficesQuery();
  const updateUserMutation = useUpdateUserMutation();

  const offices = officesQuery.data ?? [];

  // The dedicated "fully remote" button below the grid stands in for the remote
  // option, so the cards only cover the physical offices.
  const officeCards = offices.filter(
    (office) => office.name.toLowerCase() !== "remote",
  );

  function heroIdForOffice(office: Office): string {
    return office.name.toLowerCase().trim().replaceAll(" ", "-");
  }

  function findOffice(officeId: string | null): Office | undefined {
    if (!officeId) return undefined;

    return offices.find((office) => String(office.id) === officeId);
  }

  function heroIdForOfficeId(officeId: string | null): string {
    const office = findOffice(officeId);

    return office ? heroIdForOffice(office) : DEFAULT_HERO_OFFICE_ID;
  }

  function handleSelectOffice(newOfficeId: string) {
    // Compare grid positions (officeCards order == left-to-right order) to pick
    // the slide direction. Fall back to the default hero's slot when nothing was
    // selected yet, since that's the image currently on screen.
    const defaultOfficeIndex = officeCards.findIndex(
      (office) => heroIdForOffice(office) === DEFAULT_HERO_OFFICE_ID,
    );

    const oldIndex = selectedOfficeId
      ? officeCards.findIndex(
          (office) => String(office.id) === selectedOfficeId,
        )
      : defaultOfficeIndex;

    const newIndex = officeCards.findIndex(
      (office) => String(office.id) === newOfficeId,
    );

    setDirection(newIndex < oldIndex ? "left" : "right");
    setPreviousOfficeId(selectedOfficeId);
    setSelectedOfficeId(newOfficeId);
  }

  function handleContinue() {
    if (!selectedOfficeId) return;

    const selectedOffice = findOffice(selectedOfficeId);

    if (!selectedOffice) return;

    const payload: PatchUserRequest = createUpdateUserObjectPayload(
      undefined,
      undefined,
      selectedOffice.id,
    );

    updateUserMutation.mutate(payload, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: generateCurrentUserKey(),
        });

        navigate("/users/schedule", {
          state: { office: selectedOffice },
        });
      },
    });
  }

  function handleRemote() {
    // Remote users have no in-office days to pick, so persist the remote office,
    // skip the schedule screen, and drop them straight into the calendar.
    const remoteOffice = offices.find(
      (office) => office.name.toLowerCase() === "remote",
    );

    if (!remoteOffice) return;

    const payload: PatchUserRequest = createUpdateUserObjectPayload(
      undefined,
      undefined,
      remoteOffice.id,
    );

    updateUserMutation.mutate(payload, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: generateCurrentUserKey(),
        });

        navigate("/calendar");
      },
    });
  }

  const selectedHeroOfficeId = heroIdForOfficeId(selectedOfficeId);
  const previousHeroOfficeId = heroIdForOfficeId(previousOfficeId);

  // Only play the crossfade when the hero image actually changes. Picking Falls
  // Church from the initial (unselected) state is a real selection change but
  // resolves to the same default hero, so it should swap silently.
  const shouldAnimate =
    previousOfficeId !== null &&
    heroImageFor(previousHeroOfficeId) !== heroImageFor(selectedHeroOfficeId);

  if (officesQuery.isPending) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <p className="text-lg text-fg-subtle">Loading offices...</p>
      </div>
    );
  }

  if (officesQuery.isError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <p className="text-lg text-fg-subtle">
          Unable to load offices. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex w-full flex-col px-8 py-8 lg:w-[55%] lg:px-16">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 self-start text-sm font-semibold text-fg-subtle hover:text-fg"
        >
          <span aria-hidden="true">‹</span> Go back
        </button>

        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl leading-snug font-bold text-fg">
              <span className="text-fg-faint">Hearth</span> shows you who's in
              your office every day, so you can time your visits right
            </h1>

            <div className="mt-10">
              <p className="text-sm font-semibold text-fg">
                What's your primary office?
              </p>

              <p className="mt-1 text-sm text-fg-subtle">
                Pick the one you visit the most, even if you're mostly remote.
              </p>
            </div>

            <div className="mt-10">
              <OfficeOptions
                offices={offices}
                showRemoteOption={false}
                handleSelectOffice={handleSelectOffice}
              />
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedOfficeId || updateUserMutation.isPending}
              className="mt-8 w-full rounded-full bg-fill py-3 text-sm font-semibold text-fg-inverse transition-colors enabled:hover:bg-fill-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue
            </button>

            <button
              type="button"
              onClick={handleRemote}
              disabled={updateUserMutation.isPending}
              className="mt-3 w-full rounded-full border border-line-strong py-3 text-sm font-semibold text-fg transition-colors hover:border-line-faint hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60"
            >
              No home office. I'm fully remote.
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative hidden overflow-hidden bg-surface-strong lg:block lg:w-[45%]"
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
                backgroundImage: `url(${heroImageFor(previousHeroOfficeId)})`,
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
          className={cn(
            "office-hero absolute inset-y-0 -inset-x-10 bg-cover bg-center",
            shouldAnimate && "office-hero--enter",
          )}
          style={
            {
              backgroundImage: `url(${heroImageFor(selectedHeroOfficeId)})`,
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
        {officeCards.map((office) => (
          <img
            key={office.id}
            src={heroImageFor(heroIdForOffice(office))}
            alt=""
          />
        ))}
      </div>
    </div>
  );
}
