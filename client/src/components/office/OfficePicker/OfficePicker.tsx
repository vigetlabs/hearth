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
import WordLogo from "@/components/landing/Logo/WordLogo";
import Loader from "@/components/feedback/Loader";
import HeroLayer from "@/components/landing/Hero/HeroLayer";
import HeroPanel from "@/components/landing/Hero/HeroPanel";
import CornerGlow from "@/components/decorative/CornerGlow";

import {
  DEFAULT_OFFICE_NAME,
  heroIdForOfficeName,
  heroImageFor,
} from "./heroImage";

import "./OfficePicker.css";
import OfficeOptions from "@/components/office/OfficeOptions";

export default function OfficePicker() {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>("");

  // The image showing before the current selection, kept mounted so it can play
  // its exit animation. `null` means nothing has been picked yet (initial mount,
  // no transition to animate).
  const [previousOfficeId, setPreviousOfficeId] = useState<string | null>(null);

  // Which way the pair slides: "left" when the new card sits left of the old.
  const [direction, setDirection] = useState<"left" | "right">("right");

  // Hero image srcs the browser has finished loading (via the hidden preload
  // <img>s below). Until the current selection's hero is in here, the panel
  // shows a loading indicator instead of a blank gray background.
  const [loadedHeroes, setLoadedHeroes] = useState<Set<string>>(new Set());

  function markHeroLoaded(src: string) {
    setLoadedHeroes((prev) => {
      if (prev.has(src)) return prev;
      return new Set(prev).add(src);
    });
  }

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const officesQuery = useOfficesQuery();
  const updateUserMutation = useUpdateUserMutation();

  const offices = officesQuery.data ?? [];

  const officeCards = offices.filter(
    (office) => office.name.toLowerCase() !== "remote",
  );

  const remoteOffice = offices.find(
    (office) => office.name.toLowerCase() === "remote",
  );

  function heroIdForOffice(office: Office): string {
    // Remote has no hero photo of its own, so fall back to the default hero
    // rather than requesting a missing image and flashing the placeholder.
    if (office.name.toLowerCase() === "remote") {
      return heroIdForOfficeName(DEFAULT_OFFICE_NAME);
    }

    return heroIdForOfficeName(office.name);
  }

  function findOffice(officeId: string | null): Office | undefined {
    if (!officeId) return undefined;

    return offices.find((office) => String(office.id) === officeId);
  }

  function heroIdForOfficeId(officeId: string | null): string {
    const office = findOffice(officeId);

    return office
      ? heroIdForOffice(office)
      : heroIdForOfficeName(DEFAULT_OFFICE_NAME);
  }

  function handleSelectOffice(newOfficeId: string) {
    // Compare grid positions (officeCards order == left-to-right order) to pick
    // the slide direction. Fall back to the default hero's slot when nothing was
    // selected yet, since that's the image currently on screen.
    const defaultOfficeIndex = officeCards.findIndex(
      (office) =>
        heroIdForOffice(office) === heroIdForOfficeName(DEFAULT_OFFICE_NAME),
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

  function persistOfficeAndNavigate(office: Office) {
    const isRemote = office.name.toLowerCase() === "remote";

    const payload: PatchUserRequest = createUpdateUserObjectPayload({
      office_id: office.id,
    });

    updateUserMutation.mutate(payload, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: generateCurrentUserKey(),
        });

        if (isRemote) {
          navigate("/remote");
          return;
        }

        navigate("/users/schedule", {
          state: { office },
        });
      },
    });
  }

  function handleContinue() {
    if (!selectedOfficeId) return;

    const selectedOffice = findOffice(selectedOfficeId);

    if (!selectedOffice) return;

    persistOfficeAndNavigate(selectedOffice);
  }

  // Which office card is currently on screen, so the breadcrumb dots can mark it.
  // Before anything is picked, the default hero is showing, so point at its slot —
  // the same fallback handleSelectOffice uses to decide the slide direction.
  const defaultOfficeIndex = officeCards.findIndex(
    (office) =>
      heroIdForOffice(office) === heroIdForOfficeName(DEFAULT_OFFICE_NAME),
  );

  const activeOfficeIndex = selectedOfficeId
    ? officeCards.findIndex((office) => String(office.id) === selectedOfficeId)
    : defaultOfficeIndex;

  const selectedHeroOfficeId = heroIdForOfficeId(selectedOfficeId);
  const previousHeroOfficeId = heroIdForOfficeId(previousOfficeId);

  const selectedHeroImage = heroImageFor(selectedHeroOfficeId);
  const isHeroLoading = !loadedHeroes.has(selectedHeroImage);

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
    <div className="flex h-screen overflow-hidden bg-page">
      <div className="relative flex w-full flex-col px-8 py-8 lg:w-[50%] lg:px-16">
        <CornerGlow />

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="relative z-10 flex items-center gap-1 self-start text-sm font-bold text-fg-subtle transition-colors hover:text-black"
        >
          <span aria-hidden="true">‹</span> Go back
        </button>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-start pt-40 pb-12">
          <div className="w-full max-w-[90%]">
            <h1 className="text-2xl leading-snug font-bold text-fg">
              <WordLogo className="inline-block h-[0.85em] w-auto translate-y-[-0.13em] text-strong" />{" "}
              shows you who's in your primary office every day, so you can time
              your visits right
            </h1>

            <div className="mt-10">
              <p className="text-sm font-semibold text-fg">
                Which office are you based in?
              </p>

              <p className="mt-1 text-sm text-fg">
                Pick the one you visit the most, even if you're mostly remote.
              </p>
            </div>

            <div className="mt-10">
              <OfficeOptions
                offices={offices}
                showRemoteOption={false}
                selectedOfficeId={selectedOfficeId}
                handleSelectOffice={handleSelectOffice}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (remoteOffice) persistOfficeAndNavigate(remoteOffice);
              }}
              disabled={!remoteOffice || updateUserMutation.isPending}
              className="mt-8 w-full rounded-full border border-line bg-surface py-3 text-sm font-semibold text-fg transition-colors hover:border-line-faint hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60"
            >
              No home office. I'm fully remote.
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedOfficeId || updateUserMutation.isPending}
              className="mt-3 w-full rounded-full py-3 text-sm font-semibold text-fg-inverse transition-colors enabled:bg-strong enabled:hover:bg-strong-hover disabled:cursor-not-allowed disabled:bg-surface-muted"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      <HeroPanel>
        {/*
          Outgoing layer: the image from before the latest pick, sliding off and
          fading out. Only rendered once a transition has happened. Keyed by the
          new selection so it remounts (and replays its animation) every switch.
        */}
        {shouldAnimate && (
          <HeroLayer
            key={`prev-${selectedOfficeId}`}
            className="office-hero office-hero--exit"
            src={heroImageFor(previousHeroOfficeId)}
            style={
              { "--slide-sign": direction === "left" ? -1 : 1 } as CSSProperties
            }
          />
        )}

        {/*
          Incoming layer: the current selection. Slides in from the opposite side
          and fades up over the outgoing layer. Skips the enter animation on the
          very first render (no previous image to transition from).
        */}
        <HeroLayer
          key={`curr-${selectedOfficeId}`}
          className={cn("office-hero", shouldAnimate && "office-hero--enter")}
          src={selectedHeroImage}
          style={
            { "--slide-sign": direction === "left" ? -1 : 1 } as CSSProperties
          }
        />

        {/*
          Loading indicator shown over the panel until the current selection's
          hero image has finished loading, so the space reads as "loading"
          rather than a blank gray background.
        */}
        {isHeroLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-strong">
            <Loader size="h-8 w-8" />
          </div>
        )}

        {/*
          Breadcrumb-style position indicator: one dot per office hero, with the
          one currently on screen widened and brightened. This gives the sliding
          images a sense of place, so the left/right motion reads as moving
          between fixed positions rather than arbitrary shuffling.
        */}
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2">
          {officeCards.map((office, index) => (
            <span
              key={office.id}
              className={cn(
                "h-2 rounded-full shadow-sm transition-all duration-300 ease-out",
                index === activeOfficeIndex
                  ? "w-5 bg-white"
                  : "w-2 bg-white/50",
              )}
            />
          ))}
        </div>
      </HeroPanel>

      {/*
        Preload every office hero on mount so switching selection swaps the panel
        instantly. The background-image above is only fetched the first time an
        office is picked; these hidden <img>s force that fetch + decode up front.
        display:none images are still loaded by the browser.
      */}
      <div className="hidden" aria-hidden="true">
        {officeCards.map((office) => {
          const src = heroImageFor(heroIdForOffice(office));

          return (
            <img
              key={office.id}
              // Already-cached images can mount `complete` before React attaches
              // onLoad, so `onLoad` never fires — check on mount as well.
              ref={(img) => {
                if (img?.complete) markHeroLoaded(src);
              }}
              src={src}
              alt=""
              onLoad={() => markHeroLoaded(src)}
              // A missing hero degrades to the placeholder background, so stop
              // showing the loader rather than spinning forever.
              onError={() => markHeroLoaded(src)}
            />
          );
        })}
      </div>
    </div>
  );
}
