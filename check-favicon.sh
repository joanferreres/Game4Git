#!/bin/bash

# Exit on any error
set -e

PORT=5173 # Default Vite port
HOSTNAME="localhost"
BASE_URL="http://$HOSTNAME:$PORT"

echo "Checking favicon URLs for $BASE_URL"

# Function to check a URL
check_url() {
  local url=$1
  local status=$(curl -s -o /dev/null -w "%{http_code}" $url)
  
  if [ $status -eq 200 ]; then
    echo "✅ $url is accessible (HTTP 200)"
  else
    echo "❌ $url returned HTTP $status"
  fi
}

# Check favicon files
check_url "$BASE_URL/favicon.ico"
check_url "$BASE_URL/favicon-16x16.png"
check_url "$BASE_URL/favicon-32x32.png"
check_url "$BASE_URL/apple-touch-icon.png"
check_url "$BASE_URL/logo.png"
check_url "$BASE_URL/site.webmanifest"

echo "Favicon check complete" 