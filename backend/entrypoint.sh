#!/bin/sh
# seed.py is safe to run every time — it checks for existing users and
# skips itself if the database already has data (see seed.py's own
# docstring), so this never wipes or re-seeds a database that already has
# real accounts in it.
set -e
echo "Running seed.py (no-op if the database already has data)..."
python seed.py

echo "Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
