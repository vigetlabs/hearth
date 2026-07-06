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

# Build Docker services (API + DB)
build:
  {{DDC}} build

# Start dev containers in the foreground
up:
  {{DDC}} up

# Stop dev containers
down:
  {{DDC}} down

# Stop dev containers and remove existing volumes
reset:
  {{DDC}} down -v

# Open a shell inside the API container
api-shell:
  {{DDC}} exec api sh


