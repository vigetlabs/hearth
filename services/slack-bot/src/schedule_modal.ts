// The "Edit Schedule" modal: build it from a week, and read a submission back
// into a week. Slack hands back the entire form state in one `view_submission`
// payload, so a full edit is a single write — see parseSchedule.
import type { ModalView, KnownBlock, PlainTextOption } from '@slack/web-api'
import {
  LOCATION_META,
  LOCATIONS,
  WEEKDAYS,
  defaultWeek,
  isDayLocation,
  nextWeekDates,
} from './schedule_store.ts'
import type { DayLocation, WeekSchedule } from './schedule_store.ts'

// server.ts dispatches view_submission on this callback_id.
export const SCHEDULE_MODAL_CALLBACK = 'schedule_modal'

// The action_id of the radio group inside each day's input block.
const LOCATION_ACTION = 'location'

function locationOption(loc: DayLocation): PlainTextOption {
  const { emoji, label } = LOCATION_META[loc]
  return {
    text: { type: 'plain_text', text: `${emoji} ${label}`, emoji: true },
    value: loc,
  }
}

// One input block per weekday, each a 3-way radio group pre-selected to the
// user's current location for that day. `privateMetadata` is an opaque string
// Slack stores on the view and returns on submit — server.ts uses it to carry
// the original message's channel/ts so it can rewrite that message in place.
export function buildScheduleModal(
  week: WeekSchedule,
  privateMetadata?: string,
): ModalView {
  const dates = nextWeekDates()
  const blocks: KnownBlock[] = WEEKDAYS.map(({ key, label }) => ({
    type: 'input',
    block_id: key,
    label: { type: 'plain_text', text: `${label}  ·  ${dates[key]}`, emoji: true },
    element: {
      type: 'radio_buttons',
      action_id: LOCATION_ACTION,
      initial_option: locationOption(week[key]),
      options: LOCATIONS.map(locationOption),
    },
  }))

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
// block_id (weekday) then action_id.
export type SubmittedView = {
  callback_id?: string
  private_metadata?: string
  state?: {
    values?: Record<
      string,
      Record<string, { selected_option?: { value?: string } | null }>
    >
  }
}

// Turn a submission back into a WeekSchedule. Inputs are required, so a value
// should always be present; we fall back to the default for that day defensively.
export function parseSchedule(view: SubmittedView): WeekSchedule {
  const values = view.state?.values ?? {}
  const fallback = defaultWeek()
  const week = {} as WeekSchedule

  for (const { key } of WEEKDAYS) {
    const selected = values[key]?.[LOCATION_ACTION]?.selected_option?.value
    week[key] = isDayLocation(selected) ? selected : fallback[key]
  }
  return week
}
