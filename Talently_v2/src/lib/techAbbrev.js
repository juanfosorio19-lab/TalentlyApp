// src/lib/techAbbrev.js
// Helper compartido para mostrar la abreviatura de un tech en chips/badges.
// Prioriza el mapping desde Supabase (tech_stack.abbreviation, ver migración 013);
// para techs custom (no presentes en la BD) genera fallback de 2 letras uppercase.

export function getTechAbbrev(name, abbrevMap = {}) {
    if (!name) return '??';
    if (abbrevMap[name]) return abbrevMap[name];
    const clean = String(name).replace(/[^a-zA-Z0-9]/g, '');
    return clean.slice(0, 2).toUpperCase() || '??';
}

// Construye el map { name -> abbreviation } a partir del referenceData.tech_stack.
export function buildAbbrevMap(techStack = []) {
    const map = {};
    techStack.forEach((t) => {
        if (t?.name && t?.abbreviation) map[t.name] = t.abbreviation;
    });
    return map;
}
