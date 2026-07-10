// The schedule domain + its persistence seam.
//
// Today `InMemoryScheduleStore` keeps everything in a Map so the whole in-DM
// editing flow works with no backend. Later, a `LiveScheduleStore` implementing
// the same interface will call the Rails API — one endpoint keyed by user id,
// body = the whole week (see setSchedule) — and nothing else in the bot changes.

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

// A user's whole week in one object — the exact shape the future API endpoint
// takes/returns. One resource, five fields; the day is a key, not a route.
// `true` means the user is in the office that day (see OFFICE); `false` is out.
export type WeekSchedule = Record<Weekday, boolean>

export const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
]

// The office these check-ins are for. Canned for now — later this comes from the
// user's assigned office (Falls Church / Durham / …) via the API, and the modal
// + DM already read it from here so only this constant has to change.
export const OFFICE: { emoji: string; label: string } = {
  emoji: '🌸',
  label: 'Falls Church',
}

// Used until a user saves their own, and as the seed for a fresh store. Stands in
// for the "default schedule" the API will eventually own.
export function defaultWeek(): WeekSchedule {
  return {
    mon: true,
    tue: false,
    wed: true,
    thu: true,
    fri: false,
  }
}

// Next week's Monday at 00:00 local time.
export function nextMonday(): Date {
  const d = new Date()
  const daysUntilMonday = (8 - d.getDay()) % 7 || 7
  d.setDate(d.getDate() + daysUntilMonday)
  d.setHours(0, 0, 0, 0)
  return d
}

// Next week's date for each weekday, formatted like "Jul 13". Shared by the DM
// prompt and the modal so the two always show the same dates.
export function nextWeekDates(): Record<Weekday, string> {
  const monday = nextMonday()
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  const dates = {} as Record<Weekday, string>
  WEEKDAYS.forEach(({ key }, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates[key] = fmt.format(d)
  })
  return dates
}

// Render a week as Block Kit mrkdwn (for confirmation messages): each day marked
// in-office or out for the canned OFFICE.
export function formatWeek(week: WeekSchedule): string {
  return WEEKDAYS.map(({ key, label }) => {
    const mark = week[key] ? `${OFFICE.emoji} ${OFFICE.label}` : '🏠  Out'
    return `*${label}*  —  ${mark}`
  }).join('\n')
}

// Persistence seam. Swap the implementation, keep the interface. [[one-endpoint-per-user]]
export interface ScheduleStore {
  getSchedule(userId: string): Promise<WeekSchedule>
  setSchedule(userId: string, week: WeekSchedule): Promise<void>
  // The user confirmed their current week as-is (the "Confirm" button). Distinct
  // from setSchedule so the Rails seam can record an explicit confirmation
  // (e.g. a confirmed_at timestamp) rather than just another save.
  confirmSchedule(userId: string, week: WeekSchedule): Promise<void>
}

// No backend: holds schedules in memory for the life of the process. Restarting
// the server resets everyone to defaultWeek(). Fine for building/demoing the UI.
export class InMemoryScheduleStore implements ScheduleStore {
  private byUser = new Map<string, WeekSchedule>()

  async getSchedule(userId: string): Promise<WeekSchedule> {
    return this.byUser.get(userId) ?? defaultWeek()
  }

  async setSchedule(userId: string, week: WeekSchedule): Promise<void> {
    this.byUser.set(userId, week)
  }

  // No backend to notify — persist the week so the confirmed state survives
  // an in-process re-render. LiveScheduleStore will POST this to the API.
  async confirmSchedule(userId: string, week: WeekSchedule): Promise<void> {
    this.byUser.set(userId, week)
  }
}
