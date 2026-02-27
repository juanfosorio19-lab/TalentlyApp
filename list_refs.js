const fs = require('fs');
const txt = fs.readFileSync('js/app_fixed.js', 'utf8');
const m = txt.match(/reference\.[a-zA-Z]+/g);
fs.writeFileSync('refs.txt', [...new Set(m)].join('\n'));
