const fs = require('fs');
const lines = fs.readFileSync('js/app_fixed.js', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('async loadFilterOptions()')) console.log(`loadFilterOptions: ${i + 1}`);
    if (l.includes('applyFilters()')) console.log(`applyFilters: ${i + 1}`);
});
