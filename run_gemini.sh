#!/bin/bash

# Check if a prompt is provided
if [ -z "$1" ]; then
  echo "Usage: ./run_gemini.sh \"Your prompt here\""
  exit 1
fi

# Execute the Gemini CLI with the provided prompt
# Assuming the Gemini CLI executable is named 'gemini-cli' and is in your PATH.
# If not, replace 'gemini-cli' with the actual path to your Gemini CLI executable.
gemini -p "$1"

