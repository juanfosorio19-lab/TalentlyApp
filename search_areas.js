const fs = require('fs');
const content = fs.readFileSync('js/app_fixed.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
    if (l.toLowerCase().includes('talentlybackend')) {
        console.log(`[talentlyBackend] Line ${i + 1}: ${l.trim().substring(0, 80)}`);
    }
    if (l.includes('.from(')) {
        console.log(`[supabase.from] Line ${i + 1}: ${l.trim().substring(0, 80)}`);
    }
    if (l.toLowerCase().includes('getprofessional')) {
        console.log(`[getprofessional] Line ${i + 1}: ${l.trim().substring(0, 80)}`);
    }
    if (l.includes('const areas') || l.includes('const sectores')) {
        console.log(`[areas declaration] Line ${i + 1}: ${l.trim().substring(0, 80)}`);
    }
});
