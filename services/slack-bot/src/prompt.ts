import type { KnownBlock } from '@slack/web-api'

// Action id for the "Update Schedule" button — the interactivity endpoint
// (server.ts) dispatches on this.
export const UPDATE_SCHEDULE = 'update_schedule'

// Where the button sends people to edit their schedule. Stubbed for now.
const SCHEDULE_EDITOR_URL = 'https://example.com'

type DayLocation = 'office' | 'remote'
type ScheduleDay = { label: string; location: DayLocation }

const LOCATION_META: Record<DayLocation, { emoji: string; label: string }> = {
  office: { emoji: '🏢', label: 'In office' },
  remote: { emoji: '🏠', label: 'Remote' },
}

// Mock data: next week's Mon–Fri with a fixed in/out pattern. Swap this out for
// a real lookup (Rails API / DB) later — the rest of the prompt is unchanged.
function nextWeekSchedule(): ScheduleDay[] {
  const monday = nextMonday()
  const pattern: DayLocation[] = [
    'office',
    'remote',
    'office',
    'office',
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

// The weekly prompt: a nicely styled schedule for next week plus a button to
// update it. `recordId` travels on the button `value` so the interactivity
// handler can tie a click back to this send.
export function buildPrompt(recordId: string): {
  text: string
  blocks: KnownBlock[]
} {
  const week = nextWeekSchedule()
  const range = `${week[0]!.label} – ${week[week.length - 1]!.label}`

  return {
    text: `Your schedule for next week (${range})`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:calendar:  *Here's your schedule for next week!*\n_${range}_`,
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: formatSchedule(week) },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Need to change something?*\nUpdate your in-office days for next week.',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Update Schedule', emoji: true },
            action_id: UPDATE_SCHEDULE,
            style: 'primary',
            url: SCHEDULE_EDITOR_URL,
            value: recordId,
          },
        ],
      },
    ],
  }
}
