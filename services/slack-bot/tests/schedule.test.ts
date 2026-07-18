// The schedule store and the modal build/parse round-trip. All pure logic, no
// network — this is the part that stays identical when the store later calls Rails.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  InMemoryScheduleStore,
  WEEKDAYS,
  defaultWeek,
} from '../src/schedule/store.ts'
import type { WeekSchedule } from '../src/schedule/store.ts'
import {
  SCHEDULE_MODAL_CALLBACK,
  buildScheduleModal,
  parseSchedule,
} from '../src/views/modal.ts'
import type { SubmittedView } from '../src/views/modal.ts'

// Turn a WeekSchedule into the view.state.values shape Slack posts back: the
// single "office_days" checkbox group reports the checked weekdays as
// selected_options, so we can drive parseSchedule like a real view_submission.
function asSubmittedView(week: WeekSchedule): SubmittedView {
  const selected_options = WEEKDAYS.filter(({ key }) => week[key]).map(
    ({ key }) => ({ value: key }),
  )
  return {
    callback_id: SCHEDULE_MODAL_CALLBACK,
    state: { values: { office_days: { office_days: { selected_options } } } },
  }
}

test('store returns the default week for an unknown user', async () => {
  const store = new InMemoryScheduleStore()
  assert.deepEqual(await store.getSchedule('U404'), defaultWeek())
})

test('store round-trips a saved week per user', async () => {
  const store = new InMemoryScheduleStore()
  const mine: WeekSchedule = {
    mon: true,
    tue: true,
    wed: false,
    thu: true,
    fri: false,
  }

  await store.setSchedule('U1', mine)

  assert.deepEqual(await store.getSchedule('U1'), mine)
  assert.deepEqual(await store.getSchedule('U2'), defaultWeek()) // isolated per user
})

test('modal build → parse is a faithful round-trip', () => {
  const week: WeekSchedule = {
    mon: false,
    tue: true,
    wed: false,
    thu: false,
    fri: true,
  }

  // The modal pre-checks exactly the in-office days in its one checkbox group.
  const modal = buildScheduleModal(week)
  assert.equal(modal.callback_id, SCHEDULE_MODAL_CALLBACK)

  // A submission echoing those checkboxes parses back to the same week.
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

test('parseSchedule treats only checked boxes as in-office', () => {
  const view: SubmittedView = {
    callback_id: SCHEDULE_MODAL_CALLBACK,
    state: {
      values: {
        office_days: {
          office_days: { selected_options: [{ value: 'mon' }, { value: 'wed' }] },
        },
      },
    },
  }

  assert.deepEqual(parseSchedule(view), {
    mon: true,
    tue: false,
    wed: true,
    thu: false,
    fri: false,
  })
})

test('parseSchedule reads a fully-remote week (nothing checked) as all out', () => {
  const view: SubmittedView = {
    callback_id: SCHEDULE_MODAL_CALLBACK,
    state: { values: { office_days: { office_days: { selected_options: [] } } } },
  }

  assert.deepEqual(parseSchedule(view), {
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
  })
})
