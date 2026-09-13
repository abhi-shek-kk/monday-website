const fs = require('fs');

const envContent = fs.readFileSync('d:/web site/the new begining/.env', 'utf8');
const lines = envContent.split(/\r?\n/);

console.log("Total lines in .env:", lines.length);

lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.substring(0, eqIdx);
    const val = trimmed.substring(eqIdx + 1).replace(/^["']|["']$/g, '');
    let summary = `Key: ${key} | Length: ${val.length}`;
    if (key === 'DATABASE_URL') {
      const atIdx = val.indexOf('@');
      const hostPart = atIdx !== -1 ? val.substring(atIdx + 1).split('/')[0] : 'NO_AT_SYMBOL';
      summary += ` | Host: ${hostPart}`;
    } else if (key.startsWith('CLOUDINARY')) {
      summary += ` | Value prefix: ${val.substring(0, 4)}...`;
    }
    console.log(`Line ${index + 1}: ${summary}`);
  }
});
