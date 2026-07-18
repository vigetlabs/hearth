// The "Edit Schedule" modal: build it from a week, and read a submission back
// into a week. Slack hands back the entire form state in one `view_submission`
// payload, so a full edit is a single write — see parseSchedule.
import type { ModalView, KnownBlock, PlainTextOption } from '@slack/web-api'
import { OFFICE, WEEKDAYS, nextWeekDates } from '../schedule/store.ts'
import type { Weekday, WeekSchedule } from '../schedule/store.ts'

// server.ts dispatches view_submission on this callback_id.
export const SCHEDULE_MODAL_CALLBACK = 'schedule_modal'

// The block_id + action_id of the single "in office?" checkbox group. Each
// checkbox is one weekday; a checked box means "in the office that day".
const OFFICE_DAYS_BLOCK = 'office_days'
const OFFICE_DAYS_ACTION = 'office_days'

function dayOption(key: Weekday, label: string, date: string): PlainTextOption {
  return {
    text: { type: 'plain_text', text: `${label}  ·  ${date}`, emoji: true },
    value: key,
  }
}

// One checkbox per weekday, pre-checked for the days the user is in the office.
// Slack rejects an empty `initial_options`, so we omit it when no day is checked.
// The group is `optional` so a fully-remote week (nothing checked) can be saved.
// `privateMetadata` is an opaque string Slack stores on the view and returns on
// submit — server.ts uses it to carry the original message's channel/ts so it
// can rewrite that message in place.
export function buildScheduleModal(
  week: WeekSchedule,
  privateMetadata?: string,
): ModalView {
  const dates = nextWeekDates()
  const options = WEEKDAYS.map(({ key, label }) =>
    dayOption(key, label, dates[key]),
  )
  const initialOptions = options.filter((_, i) => week[WEEKDAYS[i]!.key])

  const blocks: KnownBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Which days are you in the *${OFFICE.emoji} ${OFFICE.label}* office next week?`,
      },
    },
    {
      type: 'input',
      block_id: OFFICE_DAYS_BLOCK,
      optional: true,
      label: { type: 'plain_text', text: 'In office?', emoji: true },
      element: {
        type: 'checkboxes',
        action_id: OFFICE_DAYS_ACTION,
        options,
        ...(initialOptions.length > 0
          ? { initial_options: initialOptions }
          : {}),
      },
    },
  ]

  return {
    type: 'modal',
    callback_id: SCHEDULE_MODAL_CALLBACK,
    private_metadata: privateMetadata,
    title: { type: 'plain_text', text: 'Edit Schedule' },
    submit: { type: 'plain_text', text: 'Save' },
    close: { type: 'plain_text', text: 'Cancel' },
    blocks,
  }
}

// The subset of a view_submission's `view` we read. state.values is keyed by
// block_id then action_id; a checkbox group reports its checked boxes as
// `selected_options`.
export type SubmittedView = {
  callback_id?: string
  private_metadata?: string
  state?: {
    values?: Record<
      string,
      Record<string, { selected_options?: { value?: string }[] | null }>
    >
  }
}

// Turn a submission back into a WeekSchedule: every checked box's weekday is
// in-office (true), every other weekday is out (false).
export function parseSchedule(view: SubmittedView): WeekSchedule {
  const selected =
    view.state?.values?.[OFFICE_DAYS_BLOCK]?.[OFFICE_DAYS_ACTION]
      ?.selected_options ?? []
  const inOffice = new Set(selected.map((o) => o.value))

  const week = {} as WeekSchedule
  for (const { key } of WEEKDAYS) {
    week[key] = inOffice.has(key)
  }
  return week
}
