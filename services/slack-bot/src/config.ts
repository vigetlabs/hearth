// Central place to read + validate environment configuration.
// Loaded via `node --env-file=.env` (see package.json scripts).
export const config = {
  botToken: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  usergroupId: process.env.SLACK_USERGROUP_ID,
  useSlack: process.env.USE_SLACK === 'true',
  port: Number(process.env.PORT ?? 3000),
  // Base URL of the web app the DM links to (e.g. the team calendar). Defaults
  // to the local Vite dev server so the bot runs without extra env locally.
  webAppUrl: process.env.WEB_APP_URL ?? 'http://localhost:5173',
}

type ConfigKey = keyof typeof config

// Fail fast with a clear message when a required secret is missing.
export function assertConfig(keys: ConfigKey[]): void {
  const missing = keys.filter((k) => !config[k])
  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars: ${missing
        .map((k) => k.replace(/([A-Z])/g, '_$1').toUpperCase())
        .join(', ')}. Copy .env.example to .env and fill them in.`,
    )
  }
}
