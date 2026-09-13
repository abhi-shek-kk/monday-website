const fs = require('fs');

const envPath = 'd:/web site/the new begining/.env';
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split(/\r?\n/);

let neonUrl = '';
let neonLineIndex = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.includes('neon.tech') || line.startsWith('postgresql://neondb_owner')) {
    neonUrl = line;
    neonLineIndex = i;
    break;
  }
}

if (!neonUrl) {
  console.log("No Neon URL found in .env");
  process.exit(1);
}

// Clean up neonUrl if it was pasted without key
if (!neonUrl.startsWith('DATABASE_URL=')) {
  // If it's just the URL, prefix it with DATABASE_URL=
  const cleanVal = neonUrl.replace(/^DATABASE_URL=/, '').replace(/^["']|["']$/g, '');
  neonUrl = `DATABASE_URL="${cleanVal}"`;
}

// Update line 0 (or where DATABASE_URL is defined)
lines[0] = neonUrl;

// Remove the line where neon URL was appended if it's not line 0
if (neonLineIndex > 0) {
  lines.splice(neonLineIndex, 1);
}

fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
console.log("Successfully formatted DATABASE_URL in .env!");
