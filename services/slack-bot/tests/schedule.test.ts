// The schedule store and the modal build/parse round-trip. All pure logic, no
// network — this is the part that stays identical when the store later calls Rails.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  InMemoryScheduleStore,
  defaultWeek,
  isDayLocation,
} from '../src/schedule_store.ts'
import type { WeekSchedule } from '../src/schedule_store.ts'
import {
  SCHEDULE_MODAL_CALLBACK,
  buildScheduleModal,
  parseSchedule,
} from '../src/schedule_modal.ts'
import type { SubmittedView } from '../src/schedule_modal.ts'

// Turn a WeekSchedule into the view.state.values shape Slack posts back, so we
// can drive parseSchedule the way a real view_submission would.
function asSubmittedView(week: WeekSchedule): SubmittedView {
  const values: NonNullable<
    NonNullable<SubmittedView['state']>['values']
  > = {}
  for (const [day, loc] of Object.entries(week)) {
    values[day] = { location: { selected_option: { value: loc } } }
  }
  return { callback_id: SCHEDULE_MODAL_CALLBACK, state: { values } }
}

test('store returns the default week for an unknown user', async () => {
  const store = new InMemoryScheduleStore()
  assert.deepEqual(await store.getSchedule('U404'), defaultWeek())
})

test('store round-trips a saved week per user', async () => {
  const store = new InMemoryScheduleStore()
  const mine: WeekSchedule = {
    mon: 'durham',
    tue: 'durham',
    wed: 'remote',
    thu: 'falls church',
    fri: 'remote',
  }

  await store.setSchedule('U1', mine)

  assert.deepEqual(await store.getSchedule('U1'), mine)
  assert.deepEqual(await store.getSchedule('U2'), defaultWeek()) // isolated per user
})

test('modal build → parse is a faithful round-trip', () => {
  const week: WeekSchedule = {
    mon: 'remote',
    tue: 'falls church',
    wed: 'durham',
    thu: 'remote',
    fri: 'falls church',
  }

  // The modal seeds each day's radio group with initial_option = the saved value.
  const modal = buildScheduleModal(week)
  assert.equal(modal.callback_id, SCHEDULE_MODAL_CALLBACK)
  assert.equal(modal.blocks.length, 5)

  // A submission echoing those selections parses back to the same week.
  assert.deepEqual(parseSchedule(asSubmittedView(week)), week)
})

test('modal carries private_metadata through for in-place message updates', () => {
  const ref = JSON.stringify({ channel: 'D1', ts: '111.222', recordId: 'weekly' })
  const modal = buildScheduleModal(defaultWeek(), ref)

  // Slack echoes private_metadata back verbatim on submit; the submit handler
  // parses it to find the message to rewrite.
  assert.equal(modal.private_metadata, ref)
  assert.deepEqual(JSON.parse(modal.private_metadata!), {
    channel: 'D1',
    ts: '111.222',
    recordId: 'weekly',
  })
})

test('parseSchedule falls back to the default for a missing/garbage day', () => {
  const view: SubmittedView = {
    callback_id: SCHEDULE_MODAL_CALLBACK,
    state: {
      values: {
        mon: { location: { selected_option: { value: 'durham' } } },
        tue: { location: { selected_option: { value: 'atlantis' } } }, // not a location
        // wed/thu/fri missing entirely
      },
    },
  }

  const parsed = parseSchedule(view)
  const fallback = defaultWeek()

  assert.equal(parsed.mon, 'durham')
  assert.equal(parsed.tue, fallback.tue)
  assert.equal(parsed.wed, fallback.wed)
})

test('isDayLocation guards unknown values', () => {
  assert.equal(isDayLocation('remote'), true)
  assert.equal(isDayLocation('mars'), false)
  assert.equal(isDayLocation(undefined), false)
})
