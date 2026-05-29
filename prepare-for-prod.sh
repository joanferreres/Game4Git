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
node generate-sitemap.js

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
else
  echo "❌ Error: Vite not found in node_modules, cannot build"
  exit 1
fi

# Check build directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed! dist directory not found."
    exit 1
fi

# Clean up development dependencies
echo "📦 Cleaning up and installing only production dependencies..."
npm ci --omit=dev || npm install --omit=dev

echo "🔧 Optimizing assets..."
# Gzip compression for text files
echo "   - Adding Gzip compression..."
find dist -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.svg" -o -name "*.json" \) | xargs gzip -k -f 2>/dev/null || echo "⚠️ Gzip compression failed, but continuing..."

# Brotli compression if available
if command -v brotli &> /dev/null; then
    echo "   - Adding Brotli compression..."
    find dist -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.svg" -o -name "*.json" \) | xargs brotli -k -f 2>/dev/null || echo "⚠️ Brotli compression failed, but continuing..."
fi

# Create security headers file for hosting platforms
echo "🔒 Creating security headers configuration files..."

# Create _headers file for Netlify
# frame-ancestors: iframe solo desde el portfolio; sin X-Frame-Options (obsoleto frente a CSP)
cat > dist/_headers << EOL
/*
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: no-referrer-when-downgrade
  Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' https://cdn.gpteng.co https://cdn.jsdelivr.net https://va.vercel-scripts.com blob:; img-src 'self' data:; connect-src 'self' https://cdn.jsdelivr.net; worker-src 'self' blob:; font-src 'self' https://cdn.jsdelivr.net data:; frame-ancestors 'self' https://joanferreresvivero.vercel.app;
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
EOL

# Create vercel.json for Vercel
cat > dist/vercel.json << EOL
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "no-referrer-when-downgrade" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' https://cdn.gpteng.co https://cdn.jsdelivr.net https://va.vercel-scripts.com blob:; img-src 'self' data:; connect-src 'self' https://cdn.jsdelivr.net; worker-src 'self' blob:; font-src 'self' https://cdn.jsdelivr.net data:; frame-ancestors 'self' https://joanferreresvivero.vercel.app;" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()" }
      ]
    }
  ]
}
EOL

# Output build size information
echo "📊 Production build stats:"
du -sh dist
echo "   - JavaScript:" 
du -sh dist/assets/*.js 2>/dev/null | sort -hr || echo "No JavaScript assets found"
echo "   - CSS:" 
du -sh dist/assets/*.css 2>/dev/null | sort -hr || echo "No CSS assets found"

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

# Final security recommendations
echo "🔐 Security Recommendations:"
echo "1. Enable HTTPS on your hosting provider"
echo "2. Set up regular dependency updates"
echo "3. Consider adding a Content-Security-Policy Report-Only header initially to monitor issues"
echo "4. Implement rate limiting on your hosting provider"
echo "5. Set up monitoring for your application"
echo