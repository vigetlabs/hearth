#!/usr/bin/env bash
set -e
rm -f tmp/pids/server.pid

bundle install
bin/rails db:create
bin/rails db:migrate
bin/rails
bin/rails server -b 0.0.0.0 -p 8000

