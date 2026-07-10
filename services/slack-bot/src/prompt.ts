import type { KnownBlock } from '@slack/web-api'
import { config } from './config.ts'
import { OFFICE, WEEKDAYS, defaultWeek, nextMonday } from './schedule_store.ts'
import type { WeekSchedule } from './schedule_store.ts'

// Action id for the "Edit Schedule" button. The interactivity endpoint
// (server.ts) dispatches on this and opens the schedule modal.
export const EDIT_SCHEDULE = 'edit_schedule'

// Action id for the "Confirm" button. server.ts dispatches on this, sends the
// user's current week through the store (the API seam), then re-renders this
// message with confirmed: true.
export const CONFIRM_SCHEDULE = 'confirm_schedule'

// Action id for the "See who's in" link button. It's a Slack `url` button, so
// the click opens the calendar client-side; server.ts acks it as a no-op.
export const VIEW_CALENDAR = 'view_calendar'

type ScheduleDay = { label: string; inOffice: boolean }

// Attach next week's Mon–Fri dates to a stored week's in-office flags. The dates
// are computed here; the flags come from the store (or defaultWeek()).
function nextWeekSchedule(week: WeekSchedule): ScheduleDay[] {
  const monday = nextMonday()
  const fmt = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return WEEKDAYS.map(({ key }, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { label: fmt.format(d), inOffice: week[key] }
  })
}

function formatSchedule(days: ScheduleDay[]): string {
  return days
    .map((d) => {
      const mark = d.inOffice ? `${OFFICE.emoji} ${OFFICE.label}` : '🏠 Out'
      return `*${d.label}*  —  ${mark}`
    })
    .join('\n')
}

// Renders the weekly DM for a given week. Defaults to defaultWeek() so callers
// without a stored schedule (e.g. the first send) still work; the interactivity
// endpoint passes the user's saved week to re-render the message in place.
export function buildPrompt(
  recordId: string,
  week: WeekSchedule = defaultWeek(),
  { confirmed = false }: { confirmed?: boolean } = {},
): {
  text: string
  blocks: KnownBlock[]
} {
  const days = nextWeekSchedule(week)
  const range = `${days[0]!.label} – ${days[days.length - 1]!.label}`

  type ActionElements = Extract<KnownBlock, { type: 'actions' }>['elements']

  // A url button opening the team calendar. Kept first (leftmost) so it reads as
  // the "look before you decide" step and holds a stable spot when Confirm drops
  // away on confirm. Present in both states — seeing who's in is useful either way.
  const viewButton: ActionElements[number] = {
    type: 'button',
    text: { type: 'plain_text', text: '👀 See who’s in', emoji: true },
    action_id: VIEW_CALENDAR,
    url: `${config.webAppUrl}/calendar`,
  }

  // Once confirmed, the Confirm button drops away (it's done) and a small
  // context line acknowledges it in place; Edit stays so plans can still change.
  const actionElements: ActionElements = confirmed
    ? [
        viewButton,
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Edit Schedule', emoji: true },
          action_id: EDIT_SCHEDULE,
          value: recordId,
        },
      ]
    : [
        viewButton,
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Confirm', emoji: true },
          action_id: CONFIRM_SCHEDULE,
          style: 'primary',
          value: recordId,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Edit Schedule', emoji: true },
          action_id: EDIT_SCHEDULE,
          value: recordId,
        },
      ]

  const blocks: KnownBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:wave:  *Here's your office schedule for next week!*`,
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: formatSchedule(days),
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Coordinating with your team?* \nSee who else is heading in that week, then confirm or edit your days.',
      },
    },
    {
      type: 'actions',
      elements: actionElements,
    },
  ]

  if (confirmed) {
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: ':white_check_mark:  Schedule confirmed for next week.',
        },
      ],
    })
  }

  return {
    text: `Your work locations for next week (${range})`,
    blocks,
  }
}
