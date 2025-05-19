#!/bin/bash

# Script for automating security checks before deployment to Vercel
# Author: System Administrator
# Date: $(date +%Y-%m-%d)

set -e  # Exit immediately if a command exits with a non-zero status

echo "🔒 Running security checks before deployment..."

# Check if required tools are installed
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo "❌ $1 is not installed. Please install it first."
    exit 1
  fi
}

check_command npm
check_command grep
check_command curl

# Directory to save reports
REPORT_DIR="security-reports"
mkdir -p $REPORT_DIR

# 1. Run npm audit to check for vulnerable dependencies
echo "📦 Checking for vulnerable dependencies..."
npm audit --json > $REPORT_DIR/npm-audit.json || true
VULN_COUNT=$(grep -c "severity" $REPORT_DIR/npm-audit.json || echo "0")
echo "Found $VULN_COUNT potential vulnerabilities."

# 2. Run ESLint security plugin to check for security issues in code
echo "🔍 Checking for security issues in code..."
if npm list eslint-plugin-security > /dev/null 2>&1; then
  npm run lint -- --rule 'security/detect-possible-timing-attacks:error' \
    --rule 'security/detect-eval-with-expression:error' \
    --rule 'security/detect-non-literal-require:error' \
    --rule 'security/detect-non-literal-fs-filename:error' \
    --rule 'security/detect-unsafe-regex:error' \
    --rule 'security/detect-buffer-noassert:error' \
    --rule 'security/detect-child-process:error' \
    --rule 'security/detect-disable-mustache-escape:error' \
    --rule 'security/detect-new-buffer:error' \
    --rule 'security/detect-no-csrf-before-method-override:error' \
    --rule 'security/detect-pseudoRandomBytes:error' \
    --format json > $REPORT_DIR/eslint-security.json || true
else
  echo "⚠️ eslint-plugin-security not found, skipping code security check."
  echo "Consider installing it with: npm install --save-dev eslint-plugin-security"
fi

# 3. Check for outdated packages
echo "📋 Checking for outdated packages..."
npm outdated --json > $REPORT_DIR/outdated-packages.json || true

# 4. Run basic CORS check
echo "🌐 Checking for weak CORS configuration..."
grep -r "Access-Control-Allow-Origin: \*" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" . > $REPORT_DIR/cors-check.txt || true

# 5. Check for secure headers in vercel.json
echo "🔒 Checking for security headers in vercel.json..."
if [ -f "vercel.json" ]; then
  HEADERS_COUNT=$(grep -c "Content-Security-Policy\|X-Content-Type-Options\|X-Frame-Options\|X-XSS-Protection" vercel.json || echo "0")
  if [ "$HEADERS_COUNT" -lt 4 ]; then
    echo "⚠️ Security headers might be missing in vercel.json. Check $REPORT_DIR/headers-check.txt"
    grep -A 20 "headers" vercel.json > $REPORT_DIR/headers-check.txt || true
  else
    echo "✅ Security headers found in vercel.json"
  fi
else
  echo "⚠️ vercel.json not found, can't check security headers"
fi

# 6. Check for exposed API keys or secrets
echo "🔑 Checking for exposed API keys or secrets..."
grep -r "api[K|k]ey\|secret\|password\|token" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" . | grep -v "node_modules\|package-lock.json\|.git" > $REPORT_DIR/exposed-secrets.txt || true

# 7. Generate report summary
echo "📊 Generating security report summary..."
cat > $REPORT_DIR/summary.txt << EOF
Security Check Summary ($(date))
===============================
- Dependencies with vulnerabilities: $VULN_COUNT
- Security headers check: $([ "$HEADERS_COUNT" -ge 4 ] && echo "Passed" || echo "Failed")
- Potential exposed secrets: $(grep -c . $REPORT_DIR/exposed-secrets.txt || echo "0")
- Outdated packages: $(grep -c . $REPORT_DIR/outdated-packages.json || echo "0")
- CORS issues: $(grep -c . $REPORT_DIR/cors-check.txt || echo "0")

For detailed reports, check the $REPORT_DIR directory.
EOF

cat $REPORT_DIR/summary.txt

echo ""
echo "✅ Security checks completed! Review $REPORT_DIR/summary.txt for details."

# Recommend next steps
echo ""
echo "🚀 Next steps:"
echo "1. Review and fix any security issues found"
echo "2. Run 'npm audit fix' to automatically fix vulnerable dependencies"
echo "3. Ensure all security headers are properly configured in vercel.json"
echo "4. Deploy only when all critical security issues are resolved"

exit 0 