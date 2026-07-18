// The bot's schedule view model — a deliberate mirror of the frontend calendar's
// (client/src/types/calendar/calendar.ts + client/src/util/calendar/schedule.ts),
// narrowed to the single user each DM is for.

// ---------------------------------------------------------------------------
// API shapes — mirrored from the api/ OpenAPI schema (the frontend gets these too,
// generated into client/src/types/api/openapi-schemas.ts). Hand-mirrored here as
// the minimal slice the bot reads; the schema is the source of truth for the names.
// ---------------------------------------------------------------------------


export type VisitStatus = 'planned' | 'confirmed'

export type Visit = {
  visit_date: string // YYYY-MM-DD
  status: VisitStatus
}

export type DefaultSchedule = {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

// ---------------------------------------------------------------------------
// View model — identical vocabulary to the frontend calendar.
// ---------------------------------------------------------------------------

export type AttendanceStatus =
  | 'confirmed-yes'
  | 'planning-yes'
  | 'planning-no'
  | 'confirmed-no'

export const isInOffice = (status: AttendanceStatus): boolean =>
  status === 'confirmed-yes' || status === 'planning-yes'

export const isConfirmed = (status: AttendanceStatus): boolean =>
  status === 'confirmed-yes' || status === 'confirmed-no'

// One user's week: a status per calendar day (YYYY-MM-DD). The frontend's
// WeekSchedule is Record<dateKey, PersonStatus[]> across the roster; this is the
// same shape for a single known recipient — no per-person array, no name/id.
export type UserWeekSchedule = Record<string, AttendanceStatus>

// The office these check-ins are for. Canned for now — later this comes from the
// user's assigned office via the API, and the modal + DM already read it here so
// only this constant has to change. (Kept alongside the model it decorates.)
export const OFFICE: { emoji: string; label: string } = {
  emoji: '🌸',
  label: 'Falls Church',
}

// ---------------------------------------------------------------------------
// Dates — the single source of "which days + which dates" for the whole bot, so
// the modal and the DM can never drift. Local-time throughout, keyed by a
// YYYY-MM-DD string like the frontend (client/src/util/dates/date.ts) to avoid
// toISOString timezone drift.
// ---------------------------------------------------------------------------

// Local-date key in YYYY-MM-DD form. Mirrors the frontend's toDateKey.
export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Next week's Monday at 00:00 local time.
export function nextMonday(): Date {
  const d = new Date()
  const daysUntilMonday = (8 - d.getDay()) % 7 || 7
  d.setDate(d.getDate() + daysUntilMonday)
  d.setHours(0, 0, 0, 0)
  return d
}

// A single dated weekday of the target week: its Date, its YYYY-MM-DD key, and a
// full-name label. The views format the Date however they like (e.g. "Jul 13" or
// "Mon, Jul 13") off the same underlying day.
export type WeekdayDate = { date: Date; dateKey: string; label: string }

const WEEKDAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Mon–Fri of next week. The one place that decides the prompt's date range.
export function nextWeekdays(): WeekdayDate[] {
  const monday = nextMonday()
  return WEEKDAY_LABELS.map((label, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return { date, dateKey: toDateKey(date), label }
  })
}

// ---------------------------------------------------------------------------
// Building a week — the bot's buildWeekSchedule.
// ---------------------------------------------------------------------------

// Date.getDay() order (0=Sun … 6=Sat) → default_schedule field. Same table as the
// frontend's WEEKDAY_FIELDS, used to read the matching day off default_schedule.
const WEEKDAY_FIELDS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

// A concrete visit's status → attendance status. Mirrors the frontend's
// mapVisitStatus: a visit always means "in office", carrying its confirmed/planned.
function mapVisitStatus(status: VisitStatus): AttendanceStatus {
  return status === 'confirmed' ? 'confirmed-yes' : 'planning-yes'
}

// buildWeekSchedule for one user, over just the weekdays we prompt. A visit on the
// books wins and carries its status; otherwise the default_schedule decides
// planning-yes vs planning-no — the exact rule the frontend uses.
export function buildUserWeek(
  weekdays: WeekdayDate[],
  defaultSchedule: DefaultSchedule | undefined,
  visits: Visit[],
): UserWeekSchedule {
  const visitByDate = new Map(visits.map((v) => [v.visit_date, v]))

  const week: UserWeekSchedule = {}
  for (const { date, dateKey } of weekdays) {
    const field = WEEKDAY_FIELDS[date.getDay()]!
    const visit = visitByDate.get(dateKey)

    week[dateKey] = visit
      ? mapVisitStatus(visit.status)
      : defaultSchedule?.[field]
        ? 'planning-yes'
        : 'planning-no'
  }
  return week
}

// The canned "usual week" used until a user has saved or visited anything — the
// stand-in for the default_schedule the API will eventually own. Same Mon/Wed/Thu
// pattern the old boolean default had, now expressed as next week's statuses.
const DEFAULT_SCHEDULE: DefaultSchedule = {
  monday: true,
  tuesday: false,
  wednesday: true,
  thursday: true,
  friday: false,
  saturday: false,
  sunday: false,
}

// Used until a user saves their own, and as the seed for a fresh store.
export function defaultWeek(): UserWeekSchedule {
  return buildUserWeek(nextWeekdays(), DEFAULT_SCHEDULE, [])
}

// ---------------------------------------------------------------------------
// Acting on a week.
// ---------------------------------------------------------------------------

// The user locked their week in (the Confirm button, or saving an edit — which is
// itself a confirmation). Flip every day planning→confirmed, preserving in/out.
export function confirmWeek(week: UserWeekSchedule): UserWeekSchedule {
  const confirmed: UserWeekSchedule = {}
  for (const [dateKey, status] of Object.entries(week)) {
    confirmed[dateKey] = isInOffice(status) ? 'confirmed-yes' : 'confirmed-no'
  }
  return confirmed
}

// True once the whole week is locked in — drives the DM's "confirmed" rendering
// (Confirm button drops away, green check appears) without a separate flag.
export function weekConfirmed(week: UserWeekSchedule): boolean {
  const statuses = Object.values(week)
  return statuses.length > 0 && statuses.every(isConfirmed)
}

// Render a week as Block Kit mrkdwn (for confirmation messages): each day marked
// in-office or out for the canned OFFICE.
export function formatWeek(week: UserWeekSchedule): string {
  return nextWeekdays()
    .map(({ dateKey, label }) => {
      const mark = isInOffice(week[dateKey]!)
        ? `${OFFICE.emoji} ${OFFICE.label}`
        : '🏠  Out'
      return `*${label}*  —  ${mark}`
    })
    .join('\n')
}
