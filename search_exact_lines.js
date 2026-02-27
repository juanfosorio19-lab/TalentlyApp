const fs = require('fs');
function searchFile(filename, terms) {
    const lines = fs.readFileSync(filename, 'utf8').split('\n');
    lines.forEach((line, i) => {
        const cl = line.toLowerCase();
        terms.forEach(term => {
            if (cl.includes(term.toLowerCase())) {
                console.log(`${filename}:${i + 1} => ${line.trim().substring(0, 80)}`);
            }
        });
    });
}
console.log('--- JS ---');
searchFile('js/app_fixed.js', ['updateSalarySlider', 'companyFilterSalary']);
console.log('--- HTML ---');
searchFile('index.html', ['comentarios de salario', 'compFilterSalary', 'companyFilterSalary', 'Rango Salarial']);
