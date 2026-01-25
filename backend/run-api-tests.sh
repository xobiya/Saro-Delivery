#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Ensure port is free
if ss -ltnp 2>/dev/null | grep -q ':5000'; then
  echo "ERROR: Port 5000 is already in use. Stop the running server and retry." >&2
  ss -ltnp | grep ':5000' || true
  exit 1
fi

ts="$(date +%F_%H%M%S)"
server_log="server-log-${ts}.txt"
results_log="test-results-${ts}.txt"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "Starting backend server..."
node server.js >"$server_log" 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

echo "Waiting for server to respond..."
for _ in $(seq 1 40); do
  if curl -s "http://localhost:5000/" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

if ! curl -s "http://localhost:5000/" >/dev/null 2>&1; then
  echo "ERROR: Server did not start correctly. See $server_log" >&2
  echo "--- server log (tail) ---" >&2
  tail -n 60 "$server_log" >&2 || true
  exit 1
fi

echo "Running API test suite..."
# Capture test script exit code even when piped through tee
set +e
bash test-api.sh | tee "$results_log"
TEST_EXIT=${PIPESTATUS[0]}
set -e

echo "Saved test output: $results_log"
echo "Saved server output: $server_log"
exit "$TEST_EXIT"
