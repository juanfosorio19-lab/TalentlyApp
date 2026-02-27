const fs = require('fs');
const content = fs.readFileSync('js/app_fixed.js', 'utf8');
const lines = content.split('\n');
let out = [];
lines.forEach((l, i) => {
    if (l.includes('.from(')) {
        out.push(`[Line ${i + 1}] ${l.trim()}`);
    }
});
fs.writeFileSync('db_queries.txt', out.join('\n'));
