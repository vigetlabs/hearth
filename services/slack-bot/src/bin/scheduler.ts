// Long-running process: DMs the configured Slack user group every Friday at
// 12:00 noon Eastern. Runs the same send as `npm run send-now`.
//   npm run schedule
import { CronJob } from 'cron'
import { assertConfig } from '../config.ts'
import { sendWeeklyPrompt } from '../send-prompt.ts'

assertConfig(['botToken'])

// Fridays at 12:00, Eastern (handles EST/EDT automatically via the timezone).
const job = CronJob.from({
  cronTime: '0 12 * * 5',
  timeZone: 'America/New_York',
  start: true,
  onTick: async () => {
    console.log(`[${new Date().toISOString()}] running weekly prompt`)
    try {
      const outcomes = await sendWeeklyPrompt()
      const ok = outcomes.filter((o) => o.success).length
      console.log(`  sent to ${ok}/${outcomes.length} member(s)`)
    } catch (err) {
      console.error('  weekly prompt failed:', err)
    }
  },
})

console.log(
  `Scheduler started (Fridays 12:00 America/New_York). ` +
    `Next run: ${job.nextDate().toISO()}. Ctrl+C to stop.`,
)
