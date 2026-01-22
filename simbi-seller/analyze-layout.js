const fs = require('fs');
const content = fs.readFileSync('.next/static/chunks/app/layout.js', 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);
console.log('Looking for syntax errors around line 28...');

// Check lines around 28 for potential issues
for (let i = 20; i < 40; i++) {
  if (lines[i]) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
  }
}

// Look for the actual layout function
let layoutLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function RootLayout') || lines[i].includes('RootLayout =')) {
    layoutLine = i;
    break;
  }
}

if (layoutLine !== -1) {
  console.log(`\nFound RootLayout around line: ${layoutLine + 1}`);
  console.log('Lines around RootLayout:');
  const start = Math.max(0, layoutLine - 3);
  const end = Math.min(lines.length, layoutLine + 10);
  for (let i = start; i < end; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
} else {
  console.log('\nRootLayout not found');
}