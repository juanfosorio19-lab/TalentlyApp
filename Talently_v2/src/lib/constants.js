// src/lib/constants.js
// Listas estáticas del dominio — valores que nunca cambian.
// Los datos dinámicos (países, áreas, sectores, tech, intereses) vienen de Supabase.

// ── Modalidades de trabajo ──────────────────────────────────────────────
export const WORK_MODALITIES = [
    { value: 'Remoto',     label: 'Remoto',     icon: 'home' },
    { value: 'Híbrido',    label: 'Híbrido',    icon: 'apartment' },
    { value: 'Presencial', label: 'Presencial', icon: 'business' },
];

// Mapa valor → label (para mostrar en ProfileView, OfferDetailsView, etc.)
export const MODALITY_LABELS = {
    Remoto: 'Remoto', Híbrido: 'Híbrido', Presencial: 'Presencial',
    remote: 'Remoto', hybrid: 'Híbrido', onsite: 'Presencial',
};

// ── Disponibilidad ─────────────────────────────────────────────────────
export const AVAILABILITY_OPTIONS = [
    { value: 'immediate',  label: 'Inmediata',      icon: 'bolt' },
    { value: '15_days',    label: '15 días',         icon: 'event' },
    { value: '1_month',    label: '1 mes',           icon: 'date_range' },
    { value: '2_months',   label: '2 meses',         icon: 'calendar_month' },
    { value: 'negotiable', label: 'Negociable',      icon: 'handshake' },
];

export const AVAILABILITY_LABELS = {
    immediate:  'Inmediata',
    '15_days':  '15 días',
    '1_month':  '1 mes',
    '2_months': '2 meses',
    negotiable: 'Negociable',
};

// ── Idiomas ────────────────────────────────────────────────────────────
export const LANGUAGES_LIST = [
    'Español', 'Inglés', 'Portugués', 'Francés', 'Alemán',
    'Italiano', 'Chino Mandarín', 'Japonés', 'Coreano', 'Árabe',
];

export const LANGUAGE_LEVELS = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];

// ── Monedas ────────────────────────────────────────────────────────────
export const CURRENCIES = [
    { value: 'USD', label: 'USD / Mes' },
    { value: 'CLP', label: 'CLP / Mes' },
    { value: 'EUR', label: 'EUR / Mes' },
    { value: 'ARS', label: 'ARS / Mes' },
    { value: 'COP', label: 'COP / Mes' },
    { value: 'MXN', label: 'MXN / Mes' },
];

// ── Etapas del proceso de selección ───────────────────────────────────
export const PROCESS_STAGES = [
    { value: '1',  label: '1 etapa (entrevista directa)' },
    { value: '2',  label: '2 etapas' },
    { value: '3',  label: '3 etapas' },
    { value: '4',  label: '4 etapas' },
    { value: '5',  label: '5 etapas' },
    { value: '6+', label: '6+ etapas' },
];

// ── Duración del proceso ───────────────────────────────────────────────
export const PROCESS_DURATIONS = [
    { value: 'less_1_week',   label: 'Menos de 1 semana' },
    { value: '1_2_weeks',     label: '1-2 semanas' },
    { value: '2_4_weeks',     label: '2-4 semanas' },
    { value: '1_2_months',    label: '1-2 meses' },
    { value: '2_months_plus', label: 'Más de 2 meses' },
];

// ── Etapas de empresa (filtros — fallback si referenceData vacío) ──────
export const COMPANY_STAGES_FALLBACK = [
    'Pre-seed', 'Seed', 'Serie A', 'Serie B', 'Corporativo',
];

// ── Seniority (fallback si referenceData vacío) ────────────────────────
export const SENIORITY_FALLBACK = ['Junior', 'Semi-senior', 'Senior', 'Lead'];

// ── Tags sugeridos para empresa ────────────────────────────────────────
export const COMPANY_TAGS_SUGGESTIONS = [
    'Fast-paced', 'Data-driven', 'Remote-first', 'Startup', 'Scale-up',
    'Innovación', 'Colaboración', 'Diversidad', 'Sostenibilidad', 'Ownership',
    'Aprendizaje continuo', 'Work-life balance', 'Impacto social', 'Global',
];

// ── Tech stack popular (fallback si referenceData vacío) ───────────────
export const POPULAR_TECH_FALLBACK = [
    'React', 'Node.js', 'TypeScript', 'Python', 'Java', 'Go',
    'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS',
    'GCP', 'Azure', 'Terraform', 'GraphQL', 'Next.js', 'Vue.js',
    'Angular', 'Flutter', 'Swift', 'Kotlin', 'Rust', 'C#',
    '.NET', 'Django', 'FastAPI', 'Spring Boot', 'Rails', 'Laravel',
];

// ── Upload limits ─────────────────────────────────────────────────────
export const UPLOAD_LIMITS = {
    image: {
        types: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5 MB
        label: 'JPG, PNG o WebP — máx 5 MB',
    },
    document: {
        types: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        maxSize: 10 * 1024 * 1024, // 10 MB
        label: 'PDF, DOCX — máx 10 MB',
    },
};

// ── Versión de la app ──────────────────────────────────────────────────
export const APP_VERSION = '1.0.0';
