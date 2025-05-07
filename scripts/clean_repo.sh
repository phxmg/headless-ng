#!/bin/bash

# Clean repository script
# This script removes large files from git history and sets up a clean repository

# Create a fresh branch
git checkout --orphan temp_branch

# Add all the files
git add -A

# Commit the changes
git commit -m "Initial commit"

# Delete the master branch
git branch -D master

# Rename the current branch to master
git branch -m master

# Force push to remote repository
git push -f origin master

# Set the local master branch to track the remote master branch
git branch --set-upstream-to=origin/master master

# Delete the main branch from remote
git push origin --delete main

echo "Repository cleaned and master branch reset." 