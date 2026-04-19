#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# throttle.sh — Simulate a slow network between Expo and the NestJS backend
#
# Usage:
#   ./scripts/throttle.sh            # default: 3000ms latency
#   ./scripts/throttle.sh 5000       # custom latency in ms
#   ./scripts/throttle.sh stop       # tear down the proxy
#
# Requirements: brew install toxiproxy
#
# How it works:
#   Toxiproxy creates a proxy on PROXY_PORT that forwards to the real backend
#   on BACKEND_PORT, injecting the configured latency on every request.
#   Point your Expo app at PROXY_PORT to test slow responses.
# ─────────────────────────────────────────────────────────────────────────────

PROXY_NAME="meowie-backend"
BACKEND_PORT=5005
PROXY_PORT=5006
TOXI_API="http://localhost:8474"
LATENCY=${1:-3000}  # default 3 seconds

# ── helpers ──────────────────────────────────────────────────────────────────

check_deps() {
  if ! command -v toxiproxy-server &>/dev/null || ! command -v toxiproxy-cli &>/dev/null; then
    echo "❌  toxiproxy not found. Install it with: brew install toxiproxy"
    exit 1
  fi
}

wait_for_server() {
  echo "⏳  Waiting for toxiproxy server to start..."
  for i in $(seq 1 20); do
    if curl -sf "$TOXI_API/proxies" &>/dev/null; then
      return 0
    fi
    sleep 0.3
  done
  echo "❌  toxiproxy server did not start in time"
  exit 1
}

# ── stop ─────────────────────────────────────────────────────────────────────

if [ "$1" = "stop" ]; then
  echo "🛑  Stopping toxiproxy..."
  pkill -f toxiproxy-server && echo "✅  toxiproxy stopped" || echo "ℹ️   toxiproxy was not running"
  exit 0
fi

# ── start ────────────────────────────────────────────────────────────────────

check_deps

# Kill any previous instance
pkill -f toxiproxy-server &>/dev/null || true
sleep 0.5

# Start toxiproxy server in the background
toxiproxy-server &>/tmp/toxiproxy.log &
TOXI_PID=$!
wait_for_server

# Create the proxy (delete first if it already exists)
toxiproxy-cli delete "$PROXY_NAME" &>/dev/null || true
toxiproxy-cli create \
  --listen "0.0.0.0:$PROXY_PORT" \
  --upstream "localhost:$BACKEND_PORT" \
  "$PROXY_NAME"

# Add latency toxic
toxiproxy-cli toxic add \
  --type latency \
  --attribute latency="$LATENCY" \
  --attribute jitter=0 \
  --toxicName latency-toxic \
  "$PROXY_NAME"

echo ""
echo "✅  Throttle active!"
echo "   Backend (real):  localhost:$BACKEND_PORT"
echo "   Proxy (slow):    localhost:$PROXY_PORT  ← point Expo here"
echo "   Latency:         ${LATENCY}ms"
echo ""
echo "   To stop: ./scripts/throttle.sh stop"
echo "   Logs:    tail -f /tmp/toxiproxy.log"
echo ""

# Keep script alive so the server stays up (Ctrl+C to stop)
trap "echo ''; echo '🛑  Shutting down...'; kill $TOXI_PID 2>/dev/null; exit 0" INT TERM
wait $TOXI_PID
