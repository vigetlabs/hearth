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

rubocop:
  {{DDC}} exec -T api sh -c 'bundle exec rubocop'

rubocop-fix:
  {{DDC}} exec -T api sh -c 'bundle exec rubocop -a'

rspec:
  {{DDC}} exec -T api sh -c 'bundle exec rspec'

prettier:
  cd client && npm run format


