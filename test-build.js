import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Validating production build...');

// Check if dist directory exists
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.error('❌ Error: dist directory not found. Run npm run build first.');
  process.exit(1);
}

// Check for index.html
const indexPath = path.join(__dirname, 'dist', 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ Error: index.html not found in dist directory.');
  process.exit(1);
}

// Check for JS and CSS files
const files = fs.readdirSync(path.join(__dirname, 'dist', 'assets'));
const hasJS = files.some(file => file.endsWith('.js'));
const hasCSS = files.some(file => file.endsWith('.css'));

if (!hasJS) {
  console.error('❌ Error: No JavaScript files found in dist/assets.');
  process.exit(1);
}

if (!hasCSS) {
  console.error('❌ Error: No CSS files found in dist/assets.');
  process.exit(1);
}

// Check HTML content
const htmlContent = fs.readFileSync(indexPath, 'utf-8');

// Check for critical elements
const checks = {
  'Title present': /<title[^>]*>[\s\S]*<\/title>/.test(htmlContent),
  'Root div': /<div id="root"[\s>]/.test(htmlContent),
  'CSS link': /link rel="stylesheet"/.test(htmlContent),
  'JS script': /script.*(type="module"|src)/.test(htmlContent),
  'Content Security Policy': /Content-Security-Policy/.test(htmlContent)
};

let allPassed = true;
console.log('\n📋 HTML validation results:');
for (const [check, passed] of Object.entries(checks)) {
  if (passed) {
    console.log(`✅ ${check}`);
  } else {
    console.log(`❌ ${check}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n✅ Production build validation passed!');
  console.log('📦 Your application is ready for deployment.');
} else {
  console.error('\n❌ Some checks failed. Please review the build before deploying.');
  process.exit(1);
} 
