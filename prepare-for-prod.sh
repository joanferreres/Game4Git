#!/bin/bash

# Script to prepare a web application for production deployment
echo "🚀 Preparing Git Game Visualizer for production..."

# Set environment to production
export NODE_ENV=production
export VITE_APP_ENV=production

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm to continue."
    exit 1
fi

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
if [ -d "dist" ]; then
    rm -rf dist
fi

# Check for uncommitted changes
echo "🔍 Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Warning: You have uncommitted changes. Consider committing before building for production."
  read -p "Do you want to continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
  fi
fi

# Update dependencies
echo "📦 Updating dependencies..."
npm update

# Install production dependencies only
echo "📦 Installing production dependencies..."
npm ci --omit=dev

# Run linting
echo "🔍 Linting code..."
npm run lint

# Run build
echo "🔨 Building production code..."
npm run build

# Check build directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed! dist directory not found."
    exit 1
fi

echo "🔧 Optimizing assets..."
# Gzip compression for text files
echo "   - Adding Gzip compression..."
find dist -type f -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.svg" | xargs gzip -k -f

# Find and optimize any uncompressed images (if tools are available)
echo "   - Checking for image optimization tools..."
if command -v optipng &> /dev/null; then
    echo "   - Optimizing PNG images..."
    find dist -name "*.png" -exec optipng -o5 {} \;
fi
if command -v jpegoptim &> /dev/null; then
    echo "   - Optimizing JPG images..."
    find dist -name "*.jpg" -exec jpegoptim --max=90 {} \;
fi

# Check for security issues in dependencies
echo "🔒 Checking for security vulnerabilities..."
npm audit --omit=dev

# Output build size information
echo "📊 Production build stats:"
du -sh dist
echo "   - JavaScript:" 
du -sh dist/assets/*.js | sort -hr
echo "   - CSS:" 
du -sh dist/assets/*.css | sort -hr

echo "✅ Production build preparation completed!"
echo "📁 The application is ready for deployment in the 'dist' folder."

# Deployment instructions
echo
echo "📋 Deployment Options:"
echo "1. Static hosting: Copy the contents of the 'dist' directory to your web server."
echo "2. Netlify: Connect your repository and point to the 'dist' directory."
echo "3. Vercel: Use the Vercel CLI with 'vercel --prod' command."
echo "4. GitHub Pages: Push the 'dist' directory to the gh-pages branch."
echo