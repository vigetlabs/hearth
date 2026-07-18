import crypto from 'node:crypto'
import { config } from '../config.ts'

// Verify Slack's request signature. Requires the *raw* request body, so capture
// it before any body parser rewrites it.
export function verifySlackSignature(
  rawBody: string,
  timestamp: string | undefined,
  signature: string | undefined,
  signingSecret = config.signingSecret ?? '',
): boolean {
  if (!timestamp || !signature) return false

  // Reject requests older than 5 minutes (replay protection).
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 60 * 5) return false

  const base = `v0:${timestamp}:${rawBody}`
  const digest =
    'v0=' +
    crypto.createHmac('sha256', signingSecret).update(base).digest('hex')

  const a = Buffer.from(digest)
  const b = Buffer.from(signature)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
