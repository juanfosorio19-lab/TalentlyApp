// src/data/constants.js
// Mapas de etiquetas estáticas para campos de perfil

export const AVAILABILITY_LABELS = {
    open:           'Disponible ahora',
    open_to_offers: 'Abierto a ofertas',
    not_looking:    'No disponible',
    actively_looking: 'Buscando activamente',
};

// Map de values (BD) → label visible. Tras migración 014 los values se
// normalizaron a 'Remoto'/'Híbrido'/'Presencial', pero el lookup en código
// usa .toLowerCase() defensivamente, así que mantenemos claves lowercase.
export const WORK_MODALITY_LABELS = {
    remoto:     'Remoto',
    híbrido:    'Híbrido',
    hibrido:    'Híbrido',
    presencial: 'Presencial',
};

export const AVAILABILITY_IS_OPEN = (val) =>
    val === 'open' || val === 'actively_looking';

// ── FAQs estáticas (fallback si no existe tabla en Supabase) ──
export const FAQS_DATA = [
    {
        id: 1,
        category: 'General',
        question: '¿Qué es Talently?',
        answer: 'Talently es una plataforma de emparejamiento laboral para el sector tecnológico. Conectamos candidatos con empresas a través de un sistema de swipe bidireccional, de forma que un match solo ocurre cuando ambas partes muestran interés mutuo.',
    },
    {
        id: 2,
        category: 'General',
        question: '¿Cómo funciona el match?',
        answer: 'Nuestro algoritmo analiza tus habilidades, experiencia y preferencias para mostrarte los perfiles más compatibles. Cuando dos partes hacen swipe positivo simultáneamente, se genera un match y se habilita el chat directo entre candidato y empresa.',
    },
    {
        id: 3,
        category: 'General',
        question: '¿Es gratuita la aplicación?',
        answer: 'Para los candidatos el uso de Talently es completamente gratuito. Para empresas contamos con un plan base gratuito con publicación limitada de ofertas y planes premium según el volumen de contratación.',
    },
    {
        id: 4,
        category: 'General',
        question: '¿En qué países está disponible?',
        answer: 'Talently está disponible en toda Latinoamérica y España. Puedes usar la plataforma desde cualquier país y filtrar oportunidades por modalidad (remoto, híbrido, presencial) y ubicación geográfica.',
    },
    {
        id: 5,
        category: 'Para candidatos',
        question: '¿Mi perfil es visible para todas las empresas?',
        answer: 'Tú tienes el control total de tu visibilidad. Puedes activar o desactivar la búsqueda activa desde los ajustes de tu perfil. Solo las empresas que hagas swipe positivo podrán ver tu perfil completo.',
    },
    {
        id: 6,
        category: 'Para candidatos',
        question: '¿Cómo subo mi CV?',
        answer: 'Ve a tu perfil y accede a la sección "Mi CV". Puedes subir un archivo PDF desde tu dispositivo. El CV queda disponible para las empresas con las que haces match.',
    },
    {
        id: 7,
        category: 'Para candidatos',
        question: '¿Cómo edito mi perfil después del onboarding?',
        answer: 'Puedes actualizar tu perfil en cualquier momento desde Ajustes → "Completar / editar onboarding". Los cambios se reflejan inmediatamente en el stack de swipe de las empresas.',
    },
    {
        id: 8,
        category: 'Para candidatos',
        question: '¿Cuándo se activa el chat con una empresa?',
        answer: 'El chat se habilita automáticamente cuando se produce un match mutuo. Recibirás una notificación en la app y podrás iniciar la conversación desde la sección de Matches o Mensajes.',
    },
    {
        id: 9,
        category: 'Para empresas',
        question: '¿Cómo publico una oferta de empleo?',
        answer: 'Desde tu panel ve a "Crear oferta" y completa los detalles: título, descripción, stack tecnológico, salario y modalidad. Una vez publicada, el sistema empezará a mostrar tu oferta a candidatos compatibles.',
    },
    {
        id: 10,
        category: 'Para empresas',
        question: '¿Cuántos candidatos puedo ver por oferta?',
        answer: 'En el plan gratuito puedes explorar hasta 50 candidatos al mes por oferta activa. Los planes premium eliminan este límite y añaden filtros avanzados por experiencia, habilidades y disponibilidad.',
    },
    {
        id: 11,
        category: 'Para empresas',
        question: '¿Cómo funciona el panel de estadísticas?',
        answer: 'El panel de empresa muestra métricas en tiempo real: visitas al perfil, swipes recibidos, matches activos y mensajes enviados. Los datos se actualizan diariamente y puedes ver tendencias semanales.',
    },
    {
        id: 12,
        category: 'Para empresas',
        question: '¿Puedo contactar a un candidato antes de un match?',
        answer: 'No. Talently está diseñado para que el contacto solo ocurra tras un match mutuo. Esto protege la privacidad de los candidatos y garantiza que las conversaciones sean siempre bienvenidas por ambas partes.',
    },
];
