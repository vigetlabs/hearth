import { useRef, useState } from "react";

import EditScheduleModal from "@/components/Landing/WhyHearth/EditScheduleModal";
import {
  emojiFor,
  INITIAL_SCHEDULE,
  WEEK_DATES,
  type Schedule,
} from "@/components/Landing/WhyHearth/scheduleMock";
import { redirectToGoogleSso } from "@/util/auth/redirectToGoogleSso";

import "./Slack.css";

// Shared by the message's three actions so they sit on one row of buttons; each
// one adds its own fill or outline.
const ACTION =
  "rounded-[0.4em] border px-[0.9em] py-[0.55em] transition-colors";

// "Slack-centric" section of the sign-in page, sitting between "Why Hearth" and
// the Viget article — a mock of the weekly Slack message on the left, and the
// pitch for it on the right. Once the two stack the order flips: the pitch
// reads first and the card follows it, so the section leads with what it is
// rather than dropping the reader into the mock cold.
//
// The card is also the one thing on this page you can actually use. Confirming
// swaps the message for the confirmed one Hearth posts back, and "Edit
// Schedule" opens the modal over the card, both against local state — the point
// of the section is that the whole loop happens inside the DM, and a reader who
// tries it has seen the product before signing in. "See who's in" is the one
// button that leaves the page: in Slack it opens the team calendar, which needs
// an account, so here it starts the same Google sign-in the nav and the hero
// do — the reader asked for the roster, and signing in is how they get it.
export default function Slack() {
  const [schedule, setSchedule] = useState<Schedule>(INITIAL_SCHEDULE);
  const [confirmed, setConfirmed] = useState(false);
  const [editing, setEditing] = useState(false);

  // The modal mounts into the card's frame rather than the viewport, so it
  // needs the frame's node. Held in state, not a plain ref, so that the first
  // render with a node re-renders and hands it to the modal.
  const [frame, setFrame] = useState<HTMLElement | null>(null);

  // Confirming from the card removes the Confirm button, which would drop focus
  // to the top of the document. Focus moves to the button that outlives it
  // instead, so the row stays where the keyboard left off.
  const editButtonRef = useRef<HTMLButtonElement>(null);

  function handleConfirm() {
    setConfirmed(true);
    editButtonRef.current?.focus();
  }

  function handleModalConfirm(next: Schedule) {
    setSchedule(next);
    setConfirmed(true);
    setEditing(false);
  }

  return (
    <section className="slack-section flex min-h-screen items-center justify-center bg-fg px-4 py-24 sm:py-32">
      {/* `flex-col-reverse` is what puts the copy above the card once the two
          stack — the card stays first in the source so it keeps leading the
          row at `lg`, where it sits on the left. */}
      <div className="flex w-full max-w-[71rem] flex-col-reverse items-center gap-16 lg:flex-row lg:items-center lg:gap-20">
        {/* The card's column. `slack-card-frame` is what the card's `cqw` type
            size measures itself against (see Slack.css), so the box that sets
            the card's width is the same box that sets its scale. It is also
            what the edit modal mounts into: the modal covers the DM area, so
            the box that bounds the card bounds the modal too. */}
        <figure
          ref={setFrame}
          className="slack-card-frame relative w-full max-w-[32rem] lg:w-[46%] lg:max-w-none lg:shrink-0"
        >
          {/* 18px of radius against the mock's ~15px type, expressed in em so
              it tracks the card's scale like everything else inside it. The
              border and shadow stay in px: a hairline and a cast shadow read
              the same at any card width, and scaling them would only thicken
              the line and bloat the blur on wide screens. */}
          <div className="slack-card rounded-[1.2em] border border-white/[0.08] bg-slack-surface p-[1.9em] text-left shadow-slack-card">
            <div className="flex items-center gap-[0.65em]">
              <img
                src="/images/slack-icon.png"
                alt=""
                className="h-[2.6em] w-[2.6em] rounded-[0.5em]"
              />

              <span className="font-bold text-slack-fg">Hearth</span>

              <span className="rounded-[0.3em] bg-slack-badge px-[0.5em] py-[0.15em] text-[0.62em] font-bold uppercase tracking-[0.06em] text-slack-badge-fg">
                App
              </span>

              <span className="text-[0.8em] text-slack-fg-muted">10:30 AM</span>
            </div>

            {/* Confirming rewrites the greeting and the days under it in place, similar
                behavior inside Slack DM. This means any changes within the Slack card
                or edit modal are announced instead of simply changing.*/}
            <div aria-live="polite">
              <p className="mt-[1.2em] font-bold text-slack-fg">
                {/* leading-[0] collapses the line box so the glyph sits centered
                    on the sentence rather than on its baseline */}
                <span aria-hidden="true" className="mr-[0.35em] leading-[0]">
                  {confirmed ? "✅" : "👋"}
                </span>
                {confirmed ? (
                  <>
                    Here&rsquo;s your confirmed office schedule for next week!
                  </>
                ) : (
                  <>Here&rsquo;s your office schedule for next week!</>
                )}
              </p>

              <hr className="mt-[1.2em] border-0 border-t border-white/10" />

              <ul className="mt-[1.1em] flex flex-col gap-[0.85em] text-slack-fg-body">
                {WEEK_DATES.map((day, index) => (
                  <li key={day} className="flex items-center gap-[0.45em]">
                    <span className="font-semibold">{day}</span>
                    <span aria-hidden="true" className="text-slack-fg-faint">
                      &mdash;
                    </span>
                    <span aria-hidden="true" className="leading-[0]">
                      {emojiFor(schedule[index])}
                    </span>
                    <span className="font-medium">{schedule[index]}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="mt-[1.1em] border-0 border-t border-white/10" />

            <p className="mt-[1.1em] font-semibold text-slack-fg">
              {confirmed
                ? "Need to make a change?"
                : "Coordinating with your team?"}
            </p>

            <p className="mt-[0.5em] text-[0.87em] leading-[1.45] text-slack-fg-muted">
              {confirmed
                ? "See who else is heading in that week, or edit your schedule."
                : "See who else is heading in that week, then confirm or edit your days."}
            </p>

            <div className="mt-[1.1em] flex flex-wrap gap-[0.55em] text-[0.87em] font-semibold">
              <button
                type="button"
                onClick={redirectToGoogleSso}
                className={`${ACTION} border-slack-border text-slack-fg-body hover:bg-white/5`}
              >
                <span aria-hidden="true" className="mr-[0.35em] leading-[0]">
                  👀
                </span>
                See who&rsquo;s in
              </button>

              {/* Gone once the week is confirmed: there is nothing left to
                  confirm, and the message says so above. */}
              {!confirmed && (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`${ACTION} border-transparent bg-slack-primary text-white hover:bg-slack-primary-hover`}
                >
                  Confirm
                </button>
              )}

              <button
                ref={editButtonRef}
                type="button"
                onClick={() => setEditing(true)}
                className={`${ACTION} border-slack-border text-slack-fg-body hover:bg-white/5`}
              >
                Edit Schedule
              </button>
            </div>
          </div>

          {editing && (
            <EditScheduleModal
              schedule={schedule}
              container={frame}
              onCancel={() => setEditing(false)}
              onConfirm={handleModalConfirm}
            />
          )}
        </figure>

        {/* The copy column. The indent is `lg`-only: beside the card it sets the column in from
            the row's gap, but once the two stack the copy has to stay flush
            with the card's left edge rather than sitting inset under it.

            One `gap-6` for the whole column — eyebrow, heading, paragraph and
            each of the three claims — so every break between blocks is the same
            height and the column reads as one evenly-set list of statements.

            The three claims are `lg`-only. Beside the card they fill the
            column's height against it; once the two stack they're just three
            more lines between the reader and the card, restating what the
            paragraph above already said and what the card itself demonstrates.
            The gap closes with them, so the header sits straight on the card. */}
        <div className="flex w-full max-w-[32rem] flex-col gap-6 text-left lg:max-w-none lg:pl-8">
          <p className="slack-eyebrow font-semibold uppercase tracking-[0.22em] text-panel-eyebrow">
            Slack-centric
          </p>

          <h2 className="slack-heading font-bold leading-[1.05] tracking-tight text-panel-heading">
            Viget&rsquo;s main communication tool
          </h2>

          <p className="slack-body font-medium leading-[1.5] text-panel-body">
            Every Friday, Hearth drops next week&rsquo;s schedule into your
            Slack DMs. Confirm it, tweak it, or peek at who else is heading in
            without opening another tab.
          </p>

          <p className="slack-highlight hidden font-semibold leading-[1.35] text-panel-heading lg:block">
            <span
              aria-hidden="true"
              className="inline-block size-1 rounded-full bg-current align-middle mx-2"
            />
            A weekly nudge at the right time
          </p>

          <p className="slack-highlight hidden font-semibold leading-[1.35] text-panel-heading lg:block">
            <span
              aria-hidden="true"
              className="inline-block size-1 rounded-full bg-current align-middle mx-2"
            />
            Confirm or edit straight from the message
          </p>

          <p className="slack-highlight hidden font-semibold leading-[1.35] text-panel-heading lg:block">
            <span
              aria-hidden="true"
              className="inline-block size-1 rounded-full bg-current align-middle mx-2"
            />
            One tap to see who&rsquo;s in
          </p>
        </div>
      </div>
    </section>
  );
}
