import { useState } from "react";
import { Checkbox, Dialog } from "radix-ui";

import CheckIcon from "@/components/icons/CheckIcon";
import PopOutIcon from "@/components/icons/PopOutIcon";
import XIcon from "@/components/icons/XIcon";
import {
  DEFAULT_OFFICE,
  emojiFor,
  WEEK,
  type Schedule,
} from "@/components/Landing/WhyHearth/scheduleMock";

import "./Slack.css";

interface EditScheduleModalProps {
  // The schedule the modal opens on. It is only a starting point: the modal
  // edits its own copy and hands it back on confirm, so cancelling leaves the
  // message card exactly as it was.
  schedule: Schedule;
  // Where the dialog mounts — the card's frame, so it lands over the message
  // rather than in the middle of the viewport. Null on the first render pass,
  // before the frame has a node; Radix falls back to the body until it does,
  // and the modal is never open that early.
  container: HTMLElement | null;
  onCancel: () => void;
  onConfirm: (schedule: Schedule) => void;
}

// Shared by the footer's two buttons so they sit on the same radius and rhythm
// as the buttons in the message card behind them. Written out as whole class
// strings rather than composed from color constants: Tailwind reads these files
// as text, so a class assembled from a variable never makes it into the
// stylesheet.
const CONTROL = "rounded-[0.4em] px-[0.9em] py-[0.55em]";
const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-slack-focus";

// Each boolean here is just asking yes or no for the default office.
// Like the real Slack DM, if a user wants to do more in depth changes,
// they have to visit the actual website.
type DraftWeek = readonly boolean[];

// The "Edit Schedule" modal, mocked off the one the bot actually opens.
// A titled sheet under the app's own icon,
// a section asking which days you're in the default office, one labelled
// input block per weekday holding a single "In office" checkbox, and a
// Cancel/Save footer.
//
// The sheet is the same `slack-surface` as the message card so it reads as
// another layer of the same app. It mounts into the card's own frame instead of
// the viewport, so it covers the DM the way it would inside Slack — the section
// around it stays put, and the dimmed card is still visible underneath. Radix
// Dialog handles the rest of what a modal owes: focus is trapped inside the
// sheet, Escape and clicks outside it cancel, and the page behind is hidden
// from screen readers.
//
// The component is mounted only while it is open, so `draft` starts fresh from
// the card's schedule every time it opens without an effect to resync it.
export default function EditScheduleModal({
  schedule,
  container,
  onCancel,
  onConfirm,
}: EditScheduleModalProps) {
  const [draft, setDraft] = useState<DraftWeek>(() =>
    schedule.map((office) => office !== "Out"),
  );

  function setDay(index: number, inOffice: boolean) {
    setDraft((current) =>
      current.map((day, i) => (i === index ? inOffice : day)),
    );
  }

  // Checkboxes go back to the card's offices, answering the one question the
  // modal asked: a checked day is the office named in the prompt, an unchecked
  // day is "Out". Nothing carries over from the schedule the modal opened on so a box you leave checked means
  // that office even if the day started as another one.
  function handleSave() {
    onConfirm(draft.map((inOffice) => (inOffice ? DEFAULT_OFFICE : "Out")));
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(next) => {
        if (!next) {
          onCancel();
        }
      }}
    >
      <Dialog.Portal container={container}>
        {/* Dims the card underneath. It matches the card's radius because it
            covers exactly the card's box — the frame is the card's own
            column. */}
        <Dialog.Overlay className="absolute inset-0 z-10 rounded-[1.2em] bg-slack-scrim/70" />

        {/* Inset by the same amount on all four sides, so the sheet is the
            card's own shape a step smaller and floats centered over it rather
            than being pinned to an edge. That fixes its height as well as its
            width, so the body is the flex child that gives — it takes the slack
            between header and footer, and scrolls if the card is ever shorter
            than the group inside it. `slack-modal` gives the sheet the card's
            `em` scale (see Slack.css) so everything inside — this inset
            included — sizes off the same type. */}
        <Dialog.Content className="slack-modal absolute inset-[1.6em] z-20 flex flex-col overflow-hidden rounded-[1em] border border-white/[0.08] bg-slack-surface text-left shadow-slack-modal focus:outline-none">
          <div className="flex shrink-0 items-center gap-[0.7em] border-b border-white/10 px-[1.4em] py-[1.05em]">
            {/* The same app tile the message card is posted under, so the sheet
                is visibly the same app's — Slack sets an app's icon beside the
                modal's title. */}
            <img
              src="/images/slack-icon.png"
              alt=""
              className="h-[2em] w-[2em] shrink-0 rounded-[0.4em]"
            />

            <Dialog.Title className="mr-auto text-[1.15em] font-bold text-slack-fg">
              Edit Schedule
            </Dialog.Title>

            {/* Slack's pop-out control sits left of the close button. It is
                chrome, not part of the form, so it is drawn and not wired.
                It doesn't make sense for the button to do anything in this context.*/}
            <PopOutIcon className="h-[1.1em] w-[1.1em] shrink-0 text-slack-fg-muted" />

            <Dialog.Close
              className={`rounded-[0.35em] p-[0.35em] text-slack-fg-muted transition-colors hover:bg-white/5 hover:text-slack-fg-body ${FOCUS}`}
            >
              <XIcon className="h-[1.1em] w-[1.1em]" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-[1.4em] py-[1.15em]">
            <Dialog.Description className="text-slack-fg-body">
              Which days are you in the{" "}
              <span className="font-bold">
                <span aria-hidden="true" className="leading-[0]">
                  {emojiFor(DEFAULT_OFFICE)}
                </span>{" "}
                {DEFAULT_OFFICE}
              </span>{" "}
              office next week?
            </Dialog.Description>

            {/* A day is its own input block, the way the bot builds one per
                weekday: the day names itself in the block's label, and the box
                under it asks the block's one question. Each block is a group
                carrying that label, so a screen reader reaches the box already
                knowing which day it belongs to — "Monday, In office"
                rather than five identically named checkboxes. */}
            <div className="mt-[1.2em] flex flex-col gap-[1em] text-slack-fg-body">
              {WEEK.map((day, index) => {
                const id = `edit-schedule-day-${index}`;
                const labelId = `${id}-label`;

                return (
                  <div key={day.full} role="group" aria-labelledby={labelId}>
                    <p id={labelId} className="text-[0.93em] text-slack-fg">
                      <span className="font-bold">{day.full}</span>
                      <span
                        aria-hidden="true"
                        className="px-[0.35em] font-bold text-slack-fg-faint"
                      >
                        &middot;
                      </span>
                      <span className="pl-[0.4em] text-slack-fg-muted">
                        (optional)
                      </span>
                    </p>

                    <div className="mt-[0.5em] flex items-center">
                      <Checkbox.Root
                        id={id}
                        checked={draft[index]}
                        onCheckedChange={(next) => setDay(index, next === true)}
                        className={`flex h-[1.15em] w-[1.15em] shrink-0 items-center justify-center rounded-[0.2em] border border-slack-check-border transition-colors data-[state=checked]:border-slack-check data-[state=checked]:bg-slack-check ${FOCUS}`}
                      >
                        <Checkbox.Indicator className="text-white">
                          <CheckIcon className="h-[0.85em] w-[0.85em]" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>

                      {/* The whole label is the target, so the row is clickable
                          across its text and not just on the box. */}
                      <label
                        htmlFor={id}
                        className="cursor-pointer select-none pl-[0.6em]"
                      >
                        In office
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-[0.55em] border-t border-white/10 px-[1.4em] py-[1.05em] text-[0.87em] font-semibold">
            <Dialog.Close
              className={`border border-slack-border text-slack-fg-body transition-colors hover:bg-white/5 ${CONTROL} ${FOCUS}`}
            >
              Cancel
            </Dialog.Close>

            <button
              type="button"
              onClick={handleSave}
              className={`border border-transparent bg-slack-primary text-white transition-colors hover:bg-slack-primary-hover ${CONTROL} ${FOCUS}`}
            >
              Save
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
