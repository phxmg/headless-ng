#!/bin/bash

# This script deletes the main branch from GitHub
# Run this AFTER you have changed the default branch to master in GitHub repository settings

echo "Attempting to delete the main branch from GitHub..."
git push origin --delete main

if [ $? -eq 0 ]; then
    echo "✅ Successfully deleted the main branch from GitHub."
    echo "Your repository now only has the master branch as the default."
else
    echo "❌ Failed to delete the main branch."
    echo "Make sure you have changed the default branch to master in GitHub repository settings first:"
    echo "1. Go to https://github.com/phxmg/headless-ng/settings/branches"
    echo "2. Change the default branch from 'main' to 'master'"
    echo "3. Run this script again"
fi 