#!/bin/bash

SESSION_NAME="meowie-valkey-ssm"
PROFILE=local-dev
TARGET=i-0faf03b53e1c3254b
REMOTE_HOST=meowie-cache-valkey-zwyrkb.serverless.euc1.cache.amazonaws.com
PORT=6379

# Check if tmux session already exists
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  echo "⚠️ tmux session '$SESSION_NAME' already exists."
  exit 0
fi

# Start port forwarding inside tmux
tmux new-session -d -s "$SESSION_NAME" \
  "AWS_PROFILE=$PROFILE aws ssm start-session \
    --target $TARGET \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters '{\"host\":[\"$REMOTE_HOST\"],\"portNumber\":[\"$PORT\"],\"localPortNumber\":[\"$PORT\"]}'"

if [ $? -eq 0 ]; then
  echo "✅ Port forwarding started in tmux session: $SESSION_NAME"
  echo "To view logs or interact: tmux attach -t $SESSION_NAME"
else
  echo "❌ Failed to start tmux session"
fi
