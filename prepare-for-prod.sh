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

# Generate sitemap.xml
echo "🌐 Generating sitemap.xml..."
node generate-sitemap.cjs

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

# Ensure all dependencies are installed for building
echo "📦 Installing all dependencies for building..."
npm install

# Run linting if eslint exists in node_modules
echo "🔍 Linting code..."
if [ -f "./node_modules/.bin/eslint" ]; then
  ./node_modules/.bin/eslint . || echo "⚠️ Linting encountered issues, but continuing build process..."
else
  echo "⚠️ ESLint not found in node_modules, skipping linting"
fi

# Run build with environment variables
echo "🔨 Building production code..."
if [ -f "./node_modules/.bin/vite" ]; then
  ./node_modules/.bin/vite build --mode production
  # Vite prebuild/postbuild hooks may not run when calling vite directly
  node prerender-routes.cjs || true
else
  echo "❌ Error: Vite not found in node_modules, cannot build"
  exit 1
fi

# Check build directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed! dist directory not found."
    exit 1
fi

# Ensure Cloudflare Workers headers are present (copied from public/ by Vite)
echo "🔒 Verifying security headers for Cloudflare Workers..."
if [ ! -f "dist/_headers" ]; then
  echo "⚠️  dist/_headers missing — copying from public/_headers"
  if [ -f "public/_headers" ]; then
    cp public/_headers dist/_headers
  else
    echo "❌ public/_headers not found"
    exit 1
  fi
fi

# Output build size information
echo "📊 Production build stats:"
du -sh dist
echo "   - JavaScript:"
du -sh dist/assets/*.js 2>/dev/null | sort -hr || echo "No JavaScript assets found"
echo "   - CSS:"
du -sh dist/assets/*.css 2>/dev/null | sort -hr || echo "No CSS assets found"

echo "✅ Production build preparation completed!"
echo "📁 The application is ready for deployment in the 'dist' folder."

echo
echo "📋 Deployment:"
echo "  npm run deploy"
echo "  # or: npx wrangler deploy"
echo

echo "🔐 Security Recommendations:"
echo "1. Enable HTTPS (Cloudflare Workers provides this by default)"
echo "2. Set up regular dependency updates"
echo "3. Consider adding a Content-Security-Policy Report-Only header initially to monitor issues"
echo "4. Attach your custom domain in the Cloudflare dashboard"
echo "5. Set up monitoring / Workers Observability for your application"
echo
