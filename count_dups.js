const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf16le');
const matches = [...html.matchAll(/id="([^"\s]+)"/g)];
const counts = {};
matches.forEach(m => {
    const id = m[1];
    counts[id] = (counts[id] || 0) + 1;
});
const dups = Object.entries(counts).filter(([id, c]) => c > 1);
if (dups.length > 0) {
    console.log('Duplicate IDs found:');
    dups.forEach(([id, c]) => console.log(`- ${id}: ${c} times`));
} else {
    console.log('No duplicate IDs found.');
}
