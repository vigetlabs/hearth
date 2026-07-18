// The schedule persistence seam.
//
// The schedule *domain* — the week model, its statuses, and how a week is built,
// confirmed, and rendered — lives in week.ts (a mirror of the frontend calendar).
// This file is only the store: today `InMemoryScheduleStore` keeps everything in
// a Map so the whole in-DM editing flow works with no backend. Later, a
// `LiveScheduleStore` implementing the same interface will call the Rails API —
// one endpoint keyed by user id, body = the whole week — and nothing else changes.

import { defaultWeek } from './week.ts'
import type { UserWeekSchedule } from './week.ts'

// Persistence seam. Swap the implementation, keep the interface. [[one-endpoint-per-user]]
export interface ScheduleStore {
  getSchedule(userId: string): Promise<UserWeekSchedule>
  setSchedule(userId: string, week: UserWeekSchedule): Promise<void>
  // The user confirmed their current week as-is (the "Confirm" button). Distinct
  // from setSchedule so the Rails seam can record an explicit confirmation
  // (e.g. a confirmed_at timestamp) rather than just another save.
  confirmSchedule(userId: string, week: UserWeekSchedule): Promise<void>
}

// No backend: holds schedules in memory for the life of the process. Restarting
// the server resets everyone to defaultWeek(). Fine for building/demoing the UI.
export class InMemoryScheduleStore implements ScheduleStore {
  private byUser = new Map<string, UserWeekSchedule>()

  async getSchedule(userId: string): Promise<UserWeekSchedule> {
    return this.byUser.get(userId) ?? defaultWeek()
  }

  async setSchedule(userId: string, week: UserWeekSchedule): Promise<void> {
    this.byUser.set(userId, week)
  }

  // No backend to notify — persist the week so the confirmed state survives
  // an in-process re-render. LiveScheduleStore will POST this to the API.
  async confirmSchedule(userId: string, week: UserWeekSchedule): Promise<void> {
    this.byUser.set(userId, week)
  }
}
