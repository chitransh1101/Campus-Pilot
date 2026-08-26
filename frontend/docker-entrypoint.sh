#!/bin/sh
# Runs automatically before nginx starts (nginx:alpine's own entrypoint
# executes every *.sh script in /docker-entrypoint.d/). Regenerates
# index.html from the pristine template on every container start, so
# changing API_BASE and restarting the container (not necessarily
# rebuilding it) always takes effect.
set -e
sed "s|<!--RUNTIME_CONFIG-->|<script>window.__CAMPUSPILOT_API__ = \"${API_BASE}\";</script>|" \
  /usr/share/nginx/html/index.html.tmpl > /usr/share/nginx/html/index.html
echo "campuspilot: frontend configured to call backend at ${API_BASE}"
