#!/bin/bash
echo "Running custom startup script..."

# Clean install dependencies
echo "Cleaning node_modules directory..."
rm -rf node_modules
rm -f package-lock.json

echo "Installing dependencies..."
npm install --production

# Start the app
echo "Starting the application..."
node src/index.js 