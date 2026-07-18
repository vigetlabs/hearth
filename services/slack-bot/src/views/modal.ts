// The "Edit Schedule" modal: build it from a week, and read a submission back
// into a week. Slack hands back the entire form state in one `view_submission`
// payload, so a full edit is a single write — see parseSchedule.
import type { ModalView, KnownBlock, PlainTextOption } from '@slack/web-api'
import { OFFICE, isInOffice, nextWeekdays } from '../schedule/week.ts'
import type { UserWeekSchedule } from '../schedule/week.ts'

// server.ts dispatches view_submission on this callback_id.
export const SCHEDULE_MODAL_CALLBACK = 'schedule_modal'

// The block_id + action_id of the single "in office?" checkbox group. Each
// checkbox is one weekday; a checked box means "in the office that day".
const OFFICE_DAYS_BLOCK = 'office_days'
const OFFICE_DAYS_ACTION = 'office_days'

// One checkbox per weekday, valued by its YYYY-MM-DD date key (the same key the
// week is keyed by) so a submission maps straight back onto the week.
function dayOption(dateKey: string, label: string, date: string): PlainTextOption {
  return {
    text: { type: 'plain_text', text: `${label}  ·  ${date}`, emoji: true },
    value: dateKey,
  }
}

// One checkbox per weekday, pre-checked for the days the user is in the office.
// Slack rejects an empty `initial_options`, so we omit it when no day is checked.
// The group is `optional` so a fully-remote week (nothing checked) can be saved.
// `privateMetadata` is an opaque string Slack stores on the view and returns on
// submit — server.ts uses it to carry the original message's channel/ts so it
// can rewrite that message in place.
export function buildScheduleModal(
  week: UserWeekSchedule,
  privateMetadata?: string,
): ModalView {
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  const weekdays = nextWeekdays()
  const options = weekdays.map(({ dateKey, label, date }) =>
    dayOption(dateKey, label, fmt.format(date)),
  )
  const initialOptions = options.filter((_, i) =>
    isInOffice(week[weekdays[i]!.dateKey]!),
  )

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

// Turn a submission back into a week: every checked box's day is in-office, every
// other weekday is out. This reads the raw "in office?" answer as planning-* —
// whether saving also *confirms* the week is the caller's policy (server.ts runs
// it through confirmWeek), not something the checkbox state can express.
export function parseSchedule(view: SubmittedView): UserWeekSchedule {
  const selected =
    view.state?.values?.[OFFICE_DAYS_BLOCK]?.[OFFICE_DAYS_ACTION]
      ?.selected_options ?? []
  const inOffice = new Set(selected.map((o) => o.value))

  const week: UserWeekSchedule = {}
  for (const { dateKey } of nextWeekdays()) {
    week[dateKey] = inOffice.has(dateKey) ? 'planning-yes' : 'planning-no'
  }
  return week
}
