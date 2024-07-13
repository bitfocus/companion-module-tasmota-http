#!/bin/sh
# install-hooks.sh

# Get the root of the git directory
GIT_ROOT=$(git rev-parse --git-dir)

# Copy all the hooks to the .git/hooks directory
cp -r hooks/* "$GIT_ROOT/hooks/"

echo "Hooks installed successfully."
