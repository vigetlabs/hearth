import type { KnownBlock } from '@slack/web-api'
import { LOCATION_META, WEEKDAYS, defaultWeek } from './schedule_store.ts'
import type { DayLocation, WeekSchedule } from './schedule_store.ts'

// Action id for the "Edit Schedule" button. The interactivity endpoint
// (server.ts) dispatches on this and opens the schedule modal.
export const EDIT_SCHEDULE = 'edit_schedule'

type ScheduleDay = { label: string; location: DayLocation }

// Attach next week's Mon–Fri dates to a stored week's locations. The dates are
// computed here; the locations come from the store (or defaultWeek()).
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
    return { label: fmt.format(d), location: week[key] }
  })
}

function nextMonday(): Date {
  const d = new Date()
  const daysUntilMonday = (8 - d.getDay()) % 7 || 7
  d.setDate(d.getDate() + daysUntilMonday)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatSchedule(days: ScheduleDay[]): string {
  return days
    .map((d) => {
      const { emoji, label } = LOCATION_META[d.location]
      return `${emoji}  *${d.label}*  —  ${label}`
    })
    .join('\n')
}

// Renders the weekly DM for a given week. Defaults to defaultWeek() so callers
// without a stored schedule (e.g. the first send) still work; the interactivity
// endpoint passes the user's saved week to re-render the message in place.
export function buildPrompt(
  recordId: string,
  week: WeekSchedule = defaultWeek(),
): {
  text: string
  blocks: KnownBlock[]
} {
  const days = nextWeekSchedule(week)
  const range = `${days[0]!.label} – ${days[days.length - 1]!.label}`

  return {
    text: `Your work locations for next week (${range})`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:calendar:  *Here are your work locations for next week!*`,
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
          text: '*Need to change something?* \nEdit your in-office days right here to coordinate with your team.',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Edit Schedule', emoji: true },
            action_id: EDIT_SCHEDULE,
            style: 'primary',
            value: recordId,
          },
        ],
      },
    ],
  }
}
