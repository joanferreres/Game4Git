#!/bin/bash

# Git Visualizer Deployment Script
# This script prepares and deploys the Git Visualizer application to Vercel

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting deployment process for Git Visualizer"

# Step 1: Run security checks
echo "🔒 Running security checks..."
npm run security:check
echo ""

# Step 2: Check for outdated critical dependencies
echo "📦 Checking for outdated dependencies..."
npm outdated
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

# Step 5: Deploy to Vercel
echo "🌍 Deploying to Vercel..."
echo "NOTE: You may be prompted to log in if not already authenticated"

# Ask for confirmation before deploying
read -p "Are you sure you want to deploy to Vercel? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npx vercel --prod
  echo "🎉 Deployment completed successfully!"
else
  echo "⏹️ Deployment cancelled."
  exit 0
fi 