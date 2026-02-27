const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
let out = [];
lines.forEach((l, i) => {
    if (l.includes('id="candidateSalarySliderTrack"') || l.includes('id="companySalarySliderTrack"') || l.includes('dual-range-slider')) {
        out.push(`[Line ${i + 1}] ${l.trim()}`);
    }
});
fs.writeFileSync('slider_lines.txt', out.join('\n'));
