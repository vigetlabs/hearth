set shell := ["bash", "-cu"]

CUR_BRANCH := `git branch --show-current`

SAFE_BRANCH := `git branch --show-current \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9_-]+/-/g; s/^-+//; s/-+$//'`

CUR_WORKTREE := SAFE_BRANCH

DEV_COMPOSE := "docker-compose.dev.yml"

DDC := "docker compose -p " + CUR_WORKTREE + " -f " + DEV_COMPOSE

# Show available commands
help:
  just --list

# Set up pre-commit functionality
setup-precommit:
  pre-commit install

# Manually check commit status against pre-commit hook
check:
  ./scripts/check-commit-status

# Build Docker services (API + DB)
build:
  {{DDC}} build

# Start dev containers in the foreground
api:
  {{DDC}} up

# Start the Vite development server 
client:
  cd client && ./dev-start.sh

# Stop dev containers
down:
  {{DDC}} down

# Stop dev containers and remove existing volumes
reset:
  {{DDC}} down -v

# Open a shell inside the API container
api-shell:
  {{DDC}} exec api sh

swaggerize:
  {{DDC}} exec -T api sh -c 'bundle exec rails rswag:specs:swaggerize'

rubocop:
  {{DDC}} exec -T api sh -c 'bundle exec rubocop'

rubocop-fix:
  {{DDC}} exec -T api sh -c 'bundle exec rubocop -a'

rspec:
  {{DDC}} exec -T api sh -c 'bundle exec rspec'

clear-users:
  {{DDC}} exec -T api sh -c 'rails runner "User.destroy_all"'

prettier:
  cd client && npm run format

types:
  cd client && npm run generate:api-types

# Slack bot: weekly scheduler (long-running, Fridays 12:00 ET)
slack-schedule:
  cd services/slack-bot && node --env-file=.env src/scheduler.ts

# Slack bot: send the weekly DM to the group right now
slack-send-now:
  cd services/slack-bot && node --env-file=.env src/send_now.ts

# Slack bot: interactivity endpoint for the Edit Schedule button (needs ngrok)
slack-server:
  cd services/slack-bot && node --env-file=.env src/server.ts
