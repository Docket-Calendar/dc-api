#!/bin/bash

# Exit on any error
set -e

echo "Starting update and deployment process..."

# Make sure we're on the main branch
git checkout main

# Fetch latest changes
git fetch

# Commit local changes if any
if [[ $(git status --porcelain) ]]; then
  echo "Local changes detected. Committing..."
  git add .
  git commit -m "Fix database SSL connection for Azure MySQL"
else
  echo "No local changes to commit."
fi

# Push changes to the main branch
echo "Pushing changes to main branch..."
git push

echo "Changes pushed. The GitHub Action workflow should be triggered automatically."
echo "Monitor the deployment at: https://github.com/yourusername/dc-api/actions"
echo ""
echo "Deployment complete! Wait a few minutes for the changes to propagate."
echo "Then test your API endpoint with the token." 