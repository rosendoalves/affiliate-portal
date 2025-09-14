#!/bin/sh
set -e
echo "🔧 Running prisma migrate deploy…"
npx prisma migrate deploy
echo "🚀 Starting Nest app…"
if [ -f dist/main.js ]; then
  exec node dist/main.js
elif [ -f dist/src/main.js ]; then
  exec node dist/src/main.js
else
  echo "❌ No build found in /app/dist"
  ls -la /app || true
  ls -la /app/dist || true
  exit 1
fi
