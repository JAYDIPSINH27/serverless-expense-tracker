#!/bin/bash

# Update and install necessary tools
apt-get update && apt-get install -y zip
npm install -g modclean

# Function to zip a directory
zip_directory() {
  local dir=$1
  local parent_dir=$(basename "$(dirname "$dir")")
  local current_dir=$(basename "$dir")
  local zip_name="${parent_dir}-${current_dir}.zip"
  echo "Processing directory: $dir"
  
  cd "$dir" || { echo "Failed to cd into $dir"; exit 1; }
  echo "Current directory: $(pwd)"
  
  npm install || { echo "npm install failed in $dir"; exit 1; }
  modclean --run || { echo "modclean failed in $dir"; exit 1; }
  rm -f package-lock.json

  if [ -f "index.js" ] || [ -f "index.mjs" ]; then
    echo "Found required files in $dir"
    zip -r -9 "../../$zip_name" index.* package.json node_modules || { echo "zip command failed in $dir"; exit 1; }
    echo "Created $zip_name"
    ls -l "../../$zip_name"
  else
    echo "Required files not found in $dir"
    exit 1
  fi
  
  cd - || { echo "Failed to cd back"; exit 1; }
  echo "Returned to directory: $(pwd)"
}

# Find all directories containing package.json
find backend/AWS -type f -name "package.json" | while read -r file; do
  dir=$(dirname "$file")
  zip_directory "$dir"
done

# List all .zip files created
echo "Listing all .zip files in the directory:"
find ../../ -type f -name "*.zip"
