#!/bin/bash

# This script uses GitHub CLI to:
# 1. Change the default branch to master
# 2. Delete the main branch

echo "Checking GitHub CLI authentication..."
gh auth status

if [ $? -ne 0 ]; then
  echo "❌ GitHub CLI not authenticated. Please run 'gh auth login' first."
  exit 1
fi

echo "Changing default branch to master..."
gh api \
  --method PATCH \
  /repos/phxmg/headless-ng \
  -f default_branch=master

if [ $? -eq 0 ]; then
  echo "✅ Successfully set master as the default branch."
  
  echo "Now deleting the main branch..."
  gh api \
    --method DELETE \
    /repos/phxmg/headless-ng/git/refs/heads/main
  
  if [ $? -eq 0 ]; then
    echo "✅ Successfully deleted the main branch."
    echo "Your repository now only has the master branch as the default."
  else
    echo "❌ Failed to delete the main branch."
  fi
else
  echo "❌ Failed to change the default branch."
fi

# Update local repo to remove main branch tracking
git fetch --prune
echo "Local repository updated." 