import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/util/cn";
import { useUpdateUserMutation } from "@/util/api/mutations/users/updateUserMutation";
import { createUpdateUserObjectPayload } from "@/util/api/functions/users";
import { useQueryClient } from "@tanstack/react-query";
import { generateCurrentUserKey } from "@/util/api/keys/userKeys";

/*
  A three-part intro that walks a first look at the calendar. Each step dims the
  whole screen with white/70 (the same value the confirmation-modal overlay
  uses) except for a single "hole" — the union bounding box of that step's
  focused elements — and floats a small modal near it. The hole is one absolutely
  positioned box with a huge, softly blurred white box-shadow spread, so the dim
  fades from clear into the opaque white at the hole's edges; animating its rect
  makes the highlighted area glide and reshape between steps. Any click, or the
  Enter / Space / Escape keys, advances; past the last step the tour unmounts.

  Elements are located by `data-tour` attributes so the tour stays decoupled from
  the calendar's markup:
    - day-header  → each day column's header      (Calendar/DayHeader.tsx)
    - day-roster  → each day column's roster area below the header (Calendar/DayRoster.tsx)
    - today-pill  → the "Today" pill straddling the top of today's column (Calendar/Calendar.tsx)
    - confirm-week→ the Confirm / Edit button      (CalendarPage.tsx)
  The first step folds in `today-pill` so the highlighted area reaches up to
  cover the pill sitting above today's cell (it's a no-op on weeks without today).
*/

type TourSide = "above" | "below";

interface TourStep {
  /** Selectors whose union is the highlighted (undimmed) hole. */
  targets: string[];
  /** Selectors whose union the modal is positioned against. */
  anchor: string[];
  /** Where the modal sits relative to the anchor. `above` floats the modal's
      bottom just above the anchor's top edge (clearing the header entirely and
      overlaying whatever sits above it); `below` places the modal's top just
      below the anchor's bottom edge. */
  side: TourSide;
  /** Horizontal placement of the modal against the focused area. `left` lines
      the modal's left edge up with the focused area's left edge; `right` lines
      its right edge up with the focused area's right edge; `center` (default)
      centers it on the anchor. */
  align?: "center" | "left" | "right";
  /** When true, the hole's top edge sits flush with the focused area's top
      instead of overhanging it by `HOLE_PADDING` — used so the roster step lines
      up right under the day headers rather than creeping up into them. */
  flushTop?: boolean;
  /** Optional — some steps show only a body. `{name}` is filled with the first name. */
  title?: string;
  body: string;
  cta: string;
}

const STEPS: TourStep[] = [
  {
    targets: ["day-header", "today-pill"],
    anchor: ["day-header"],
    side: "above",
    align: "left",
    title: "You're all set, {name} 🎉",
    body: "Your week starts with your default schedule. Click the day cards above to select or deselect the days you plan to be in the office.",
    cta: "Next",
  },
  {
    targets: ["day-roster"],
    anchor: ["day-roster"],
    side: "above",
    align: "left",
    flushTop: true,
    body: "Below each day, switch between In Office and Not in Office to see who has confirmed their plans and who is still planning.",
    cta: "Next",
  },
  {
    targets: ["confirm-week"],
    anchor: ["confirm-week"],
    side: "below",
    align: "right",
    title: "Review, then Confirm Week",
    body: "When your week looks right, confirm it so everyone can plan accordingly. Hearth will remind you on Slack every Friday to review the week ahead.",
    cta: "Got it. Let's Plan",
  },
];

// Vertical space left between the focused element and the modal.
const GAP = 16;
// Slack added around the focused elements so the hole sits a little outside them.
const HOLE_PADDING = 8;
// A short beat so the calendar is settled before the tour fades in.
const START_DELAY_MS = 500;
// Keeps the modal off the very edge of the viewport when clamped.
const VIEWPORT_MARGIN = 8;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Union bounding box (in viewport coordinates) of every element matching any
    of the given `data-tour` selectors, or null if none are present. */
function unionRect(selectors: string[]): Rect | null {
  const elements = selectors.flatMap((selector) =>
    Array.from(
      document.querySelectorAll<HTMLElement>(`[data-tour="${selector}"]`),
    ),
  );

  if (elements.length === 0) {
    return null;
  }

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  }

  return { left, top, width: right - left, height: bottom - top };
}

interface CalendarTourProps {
  /** The logged-in user's first name, woven into the opening step's title. */
  firstName: string;
}

export default function CalendarTour({ firstName }: CalendarTourProps) {
  const [active, setActive] = useState(true);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [hole, setHole] = useState<Rect | null>(null);
  const [modalPos, setModalPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const step = STEPS[current];
  const title = step.title?.replace("{name}", firstName);

  // Start after a short delay so the calendar has settled before the tour shows.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setStarted(true), START_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const updateUserMutation = useUpdateUserMutation();
  const queryClient = useQueryClient();

  const next = useCallback(() => {
    setCurrent((currentStep) => {
      if (currentStep < STEPS.length - 1) {
        return currentStep + 1;
      }

      updateUserMutation.mutate(
        createUpdateUserObjectPayload({
          is_onboarding_complete: true,
        }),
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries({
              queryKey: generateCurrentUserKey(),
            });
            setActive(false);
          },
        },
      );

      return currentStep;
    });
  }, [queryClient, updateUserMutation]);

  // Position the hole and the modal for the current step, re-measuring on the
  // next frame and whenever the viewport / layout shifts, so both stay aligned.
  // Measuring happens inside the rAF / observer callbacks (never synchronously
  // in the effect body); CSS transitions animate the resulting rect changes.
  useEffect(() => {
    if (!active || !started) {
      return;
    }

    let frame = 0;

    const measure = () => {
      const holeRect = unionRect(step.targets);

      // The step's focused elements aren't on the page (e.g. the Remote view has
      // no day cells or Confirm button). End the tour rather than leave an
      // invisible overlay swallowing clicks.
      if (!holeRect) {
        setActive(false);
        return;
      }

      setHole(holeRect);

      const anchorRect = unionRect(step.anchor);

      if (!anchorRect || !modalRef.current) {
        return;
      }

      const modal = modalRef.current.getBoundingClientRect();
      const anchorCenterX = anchorRect.left + anchorRect.width / 2;
      const anchorTop = anchorRect.top;
      const anchorBottom = anchorRect.top + anchorRect.height;

      const top =
        step.side === "above"
          ? anchorTop - GAP - modal.height
          : anchorBottom + GAP;
      // `left` pins the modal's left edge to the focused area's left edge;
      // `right` pins its right edge to the focused area's right edge; otherwise
      // it centers on the anchor.
      const left =
        step.align === "left"
          ? holeRect.left
          : step.align === "right"
            ? holeRect.left + holeRect.width - modal.width
            : anchorCenterX - modal.width / 2;

      const clampedLeft = Math.min(
        Math.max(left, VIEWPORT_MARGIN),
        window.innerWidth - modal.width - VIEWPORT_MARGIN,
      );
      const clampedTop = Math.min(
        Math.max(top, VIEWPORT_MARGIN),
        window.innerHeight - modal.height - VIEWPORT_MARGIN,
      );

      setModalPos({ top: clampedTop, left: clampedLeft });
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("resize", schedule);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      resizeObserver.disconnect();
    };
  }, [active, started, step]);

  // Enter, Space, and Escape all advance — Escape is not treated specially.
  useEffect(() => {
    if (!active || !started) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (["Enter", " ", "Spacebar", "Escape"].includes(event.key)) {
        event.preventDefault();
        next();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, started, next]);

  if (!active || !started) {
    return null;
  }

  const ready = hole !== null && modalPos !== null;
  // Most steps overhang the focused area equally on all sides; `flushTop` steps
  // drop the top overhang so the hole's top edge lands right on the target.
  const topPadding = step.flushTop ? 0 : HOLE_PADDING;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[60] transition-opacity duration-300",
        ready ? "opacity-100" : "opacity-0",
      )}
      onClick={next}
    >
      {/* The dim: a rect matching the hole with two stacked shadows. The outset
          shadow's giant spread fills the rest of the screen with opaque white;
          the inset shadow feathers that white inward from the hole's edges, so
          the focused area eases from clear at its center into the dim rather
          than cutting hard. (A blur on the outset shadow alone can't do this —
          its inner boundary is a crisp clip against the box.) Animating the rect
          morphs the spotlight between steps. */}
      {hole && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed transition-all duration-[400ms] ease-in-out motion-reduce:transition-none"
          style={{
            top: hole.top - topPadding,
            left: hole.left - HOLE_PADDING,
            width: hole.width + HOLE_PADDING * 2,
            height: hole.height + topPadding + HOLE_PADDING,
            boxShadow:
              "0 0 0 9999px rgba(255, 255, 255, 0.7), inset 0 0 18px 6px rgba(255, 255, 255, 0.7)",
          }}
        />
      )}

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        {...(title
          ? { "aria-labelledby": "calendar-tour-title" }
          : { "aria-label": "Calendar tour" })}
        className="fixed w-[320px] max-w-[calc(100vw-16px)] rounded-2xl bg-surface p-3.5 shadow-[0px_10px_36px_0px_#00000038] transition-all duration-[400ms] ease-in-out motion-reduce:transition-none"
        style={
          modalPos
            ? { top: modalPos.top, left: modalPos.left }
            : { top: -9999, left: -9999 }
        }
      >
        {title && (
          <h2
            id="calendar-tour-title"
            className="text-[15px] font-bold text-fg"
          >
            {title}
          </h2>
        )}
        <p
          className={cn(
            "text-[12px] leading-snug text-fg-muted",
            title && "mt-1",
          )}
        >
          {step.body}
        </p>

        <div className="mt-3 flex items-center justify-between">
          {/* Breadcrumb: the active step widens into a terracotta pill, matching
              the office-picker's position indicator. */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 ease-out",
                  index === current ? "w-4 bg-strong" : "w-1.5 bg-line-strong",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            className="rounded-lg bg-fill px-4 py-1.5 text-[12px] font-semibold text-fg-inverse transition-colors hover:bg-fill-hover"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? "Preparing..." : step.cta}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
