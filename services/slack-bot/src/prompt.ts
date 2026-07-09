import type { KnownBlock } from '@slack/web-api'
import { LOCATION_META } from './schedule_store.ts'
import type { DayLocation } from './schedule_store.ts'

// Action id for the "Edit Schedule" button. The interactivity endpoint
// (server.ts) dispatches on this and opens the schedule modal.
export const EDIT_SCHEDULE = 'edit_schedule'

type ScheduleDay = { label: string; location: DayLocation }

// Mock data: next week's Mon–Fri with a fixed in/out pattern. Swap this out for
// a real lookup (Rails API / DB) later — the rest of the prompt is unchanged.
function nextWeekSchedule(): ScheduleDay[] {
  const monday = nextMonday()
  const pattern: DayLocation[] = [
    'falls church',
    'remote',
    'durham',
    'falls church',
    'remote',
  ]
  const fmt = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return pattern.map((location, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { label: fmt.format(d), location }
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

export function buildPrompt(recordId: string): {
  text: string
  blocks: KnownBlock[]
} {
  const week = nextWeekSchedule()
  const range = `${week[0]!.label} – ${week[week.length - 1]!.label}`

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
          text: formatSchedule(week),
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
