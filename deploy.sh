#!/bin/bash

# Git Visualizer Deployment Script
# Prepares and deploys the application to Cloudflare Workers

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting deployment process for Git Visualizer (Cloudflare Workers)"

# Step 1: Run security checks
echo "🔒 Running security checks..."
npm run security:check
echo ""

# Step 2: Check for outdated critical dependencies
echo "📦 Checking for outdated dependencies..."
npm outdated || true
echo ""

# Step 3: Build the application
echo "🔨 Building the application..."
npm run build
echo ""

# Step 4: Run the build verification
echo "✅ Verifying the build..."
if [ ! -d "dist" ]; then
  echo "❌ Build failed: 'dist' directory not found!"
  exit 1
fi

if [ ! -f "dist/_headers" ]; then
  echo "⚠️  Warning: dist/_headers not found — security headers may be missing"
fi

# Step 5: Deploy to Cloudflare Workers
echo "🌍 Deploying to Cloudflare Workers..."
echo "NOTE: You may be prompted to log in if not already authenticated"

# Ask for confirmation before deploying
read -p "Are you sure you want to deploy to Cloudflare? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npx wrangler deploy
  echo "🎉 Deployment completed successfully!"
else
  echo "⏹️ Deployment cancelled."
  exit 0
fi
