#!/bin/bash

echo "🛑 Stopping Heartbeat Services..."

# Kill processes taking up our ports
lsof -t -i:8000 | xargs kill -9 2>/dev/null
lsof -t -i:3001 | xargs kill -9 2>/dev/null
lsof -t -i:5174 | xargs kill -9 2>/dev/null

echo "✅ All frontend, backend, and AI services stopped."
