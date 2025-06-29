#!/bin/bash

# Check if a prompt is provided
if [ -z "$1" ]; then
  echo "Usage: ./run_claude.sh \"Your prompt here\""
  exit 1
fi

# Execute the Claude Code CLI with the provided prompt in run mode
# Assuming the Claude Code CLI executable is named 'claude' and is in your PATH.
# If not, replace 'claude' with the actual path to your Claude Code CLI executable.
claude -p "$1"
