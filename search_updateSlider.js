const fs = require('fs');
const content = fs.readFileSync('js/app_fixed.js', 'utf8');
const lines = content.split('\n');
let out = [];
let capture = false;
lines.forEach((l, i) => {
    if (l.includes('updateSalarySlider(')) capture = true;
    if (capture) {
        out.push(`[Line ${i + 1}] ${l}`);
        if (l.trim() === '},' || l.trim() === '}') {
            capture = false;
        }
    }
});
fs.writeFileSync('updateSlider_body.txt', out.join('\n'));
