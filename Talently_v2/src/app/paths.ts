// Constructores tipados de rutas (spec §5.4). Ninguna pantalla escribe una
// ruta a mano: así no vuelve a existir un enlace roto como /app/offers/:id.

export type ExploreType = 'empleo' | 'turno' | 'clase' | 'servicio' | 'personas';
export type ActivitySegment = 'agenda' | 'postulaciones' | 'publicaciones';

const q = (params: Record<string, string | undefined>) => {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) s.set(k, v);
    const str = s.toString();
    return str ? `?${str}` : '';
};

export const paths = {
    // Pestañas
    inicio: () => '/inicio',
    explorar: (tipo?: ExploreType) => `/explorar${q({ tipo })}`,
    actividad: (seg?: ActivitySegment) => `/actividad${q({ seg })}`,
    mensajes: () => '/mensajes',
    perfil: () => '/perfil',

    // Apiladas
    conversacion: (conversationId: string) => `/mensajes/${conversationId}`,
    notificaciones: () => '/notificaciones',
    buscar: (texto?: string) => `/buscar${q({ q: texto })}`,
    publicacion: (id: string) => `/p/${id}`,
    gestionarPublicacion: (id: string) => `/publicaciones/${id}`,
    postulantes: (id: string) => `/publicaciones/${id}/postulantes`,
    sugeridos: (id: string) => `/publicaciones/${id}/sugeridos`,
    cuposTurno: (id: string, shiftId: string) => `/publicaciones/${id}/turnos/${shiftId}`,
    proceso: (engagementId: string) => `/procesos/${engagementId}`,
    miTurno: (assignmentId: string) => `/turnos/${assignmentId}`,
    perfilPublico: (id: string, ver?: 'trabajo' | 'servicios' | 'clases') => `/u/${id}${q({ ver })}`,
    organizacion: (id: string) => `/o/${id}`,
    verificacion: () => '/verificacion',
    configuracion: () => '/configuracion',
    terminos: () => '/terminos',
    privacidad: () => '/privacidad',
    ayuda: () => '/ayuda',

    // Solo desarrollo
    catalogo: () => '/dev/ui',
} as const;

/** Las 5 pestañas, en el orden fijo de la BottomTabBar. */
export const TAB_KEYS = ['inicio', 'explorar', 'actividad', 'mensajes', 'perfil'] as const;
export type TabKey = (typeof TAB_KEYS)[number];

/** Pestaña a la que pertenece una ruta (la primera parte del path). */
export function tabOf(pathname: string): TabKey | null {
    const first = pathname.split('/')[1] ?? '';
    return (TAB_KEYS as readonly string[]).includes(first) ? (first as TabKey) : null;
}
