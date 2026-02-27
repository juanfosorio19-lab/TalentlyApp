const fs = require('fs');
// Read as buffer and strip null bytes if any, to force a clean UTF-8 string
let buf = fs.readFileSync('index.html');
let cleanBuf = Buffer.alloc(buf.length);
let j = 0;
for (let i = 0; i < buf.length; i++) {
    if (buf[i] !== 0) {
        cleanBuf[j++] = buf[i];
    }
}
let html = cleanBuf.slice(0, j).toString('utf8');

const regex = /id=["']([^"']+)["']/gi;
let match;
let idCounts = {};
let duplicates = new Set();

while ((match = regex.exec(html)) !== null) {
    let id = match[1];
    idCounts[id] = (idCounts[id] || 0) + 1;
    if (idCounts[id] > 1) {
        duplicates.add(id);
    }
}

console.log('Duplicates found:', Array.from(duplicates));

// Specific hardcoded fixes for known issues just to be absolutely safe
const idsToFix = ['expCompany', 'eduDegree', ...Array.from(duplicates)];
let fixedHtml = html;

idsToFix.forEach(id => {
    let count = 0;
    fixedHtml = fixedHtml.replace(new RegExp('id=["\']' + id + '["\']', 'g'), (m) => {
        count++;
        if (count === 2) {
            console.log(`Renaming 2nd instance of ${id} to ${id}_stitch`);
            return `id="${id}_stitch"`;
        }
        return m;
    });
    let forCount = 0;
    fixedHtml = fixedHtml.replace(new RegExp('for=["\']' + id + '["\']', 'g'), (m) => {
        forCount++;
        if (forCount === 2) return `for="${id}_stitch"`;
        return m;
    });
});

fs.writeFileSync('index.html', fixedHtml, 'utf8');
console.log('Finished fixing duplicates and forced clean UTF-8 encoding!');
