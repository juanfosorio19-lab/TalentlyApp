// Constructores tipados de rutas (spec §5.4). Ninguna pantalla escribe una
// ruta a mano: así no vuelve a existir un enlace roto como /app/offers/:id.

export type ExploreType = 'empleo' | 'turno' | 'clase' | 'servicio' | 'personas';
export type ActivitySegment = 'agenda' | 'postulaciones' | 'publicaciones';
/** Pestañas de GES-04 (`?ver=`). */
export type RosterTab = 'confirmados' | 'postulados' | 'espera';

export interface ExploreOptions {
    /** EXP-05: la publicación de la que se sugieren personas (`?p=`). */
    p?: string;
    /** Deck o lista; Explorar la lee en `<tipo>.vista` (`empleo.vista=lista`). */
    vista?: 'deck' | 'lista';
}

const q = (params: Record<string, string | undefined>) => {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) s.set(k, v);
    const str = s.toString();
    return str ? `?${str}` : '';
};

export const paths = {
    // Pestañas
    inicio: () => '/inicio',
    explorar: (tipo?: ExploreType, opts: ExploreOptions = {}) =>
        `/explorar${q({ tipo, p: opts.p, ...(tipo && opts.vista ? { [`${tipo}.vista`]: opts.vista } : {}) })}`,
    actividad: (seg?: ActivitySegment) => `/actividad${q({ seg })}`,
    mensajes: () => '/mensajes',
    /** PRF-01; con `sheet`, abre la hoja de Perfil (`cv`: «Subir CV», desde «Te falta 1 cosa» de Inicio). */
    perfil: (sheet?: 'cv') => `/perfil${q({ sheet })}`,

    // Apiladas
    conversacion: (conversationId: string) => `/mensajes/${conversationId}`,
    notificaciones: () => '/notificaciones',
    buscar: (texto?: string) => `/buscar${q({ q: texto })}`,
    /** DET-01; `postular` abre DET-02 (el «Me interesa» del deck) y `telefono`, AUTH-08 (`?sheet=`). */
    publicacion: (id: string, sheet?: 'postular' | 'telefono') => `/p/${id}${q({ sheet })}`,
    gestionarPublicacion: (id: string) => `/publicaciones/${id}`,
    /** GES-01 · Editar: reutiliza los pasos del asistente con los datos cargados (aún sin pantalla). */
    editarPublicacion: (id: string) => `/publicaciones/${id}/editar`,
    postulantes: (id: string) => `/publicaciones/${id}/postulantes`,
    sugeridos: (id: string) => `/publicaciones/${id}/sugeridos`,
    cuposTurno: (id: string, shiftId: string, ver?: RosterTab) => `/publicaciones/${id}/turnos/${shiftId}${q({ ver })}`,
    proceso: (engagementId: string) => `/procesos/${engagementId}`,
    miTurno: (assignmentId: string) => `/turnos/${assignmentId}`,
    /** REV-01 · Dejar reseña después de un turno, clase o servicio. */
    resena: (engagementId: string) => `/resena/${engagementId}`,
    /** PRF-12 · Impulsa tu perfil (solo perfil de trabajo). */
    impulsar: () => '/perfil/impulsar',
    /** VER-02 · Verificar identidad; con `volver`, la pantalla a la que vuelve al terminar (PUBL-04 → VER-02 → PUBL-07). */
    verificarIdentidad: (volver?: string) => `/verificacion/identidad${q({ volver })}`,
    /** VER-03 · Subir credencial (aún sin pantalla). */
    subirCredencial: (tipo: string) => `/verificacion/credencial/${tipo}`,
    /** PUBL-02 a PUBL-06 · asistentes de publicación, paso a paso en la URL. */
    publicar: (tipo: 'empleo' | 'turno' | 'hogar' | 'clase' | 'servicio', paso = 1) => `/publicar/${tipo}/${paso}`,
    /** PUBL-07 · Publicación enviada. */
    publicado: (tipo: 'empleo' | 'turno' | 'hogar' | 'clase' | 'servicio') => `/publicar/${tipo}/listo`,
    /** AUTH-01 · Bienvenida (fuera de la sesión). */
    bienvenida: () => '/bienvenida',
    registro: () => '/registro',
    /** AUTH-03 · Revisa tu correo. */
    verificarCorreo: () => '/registro/verificar',
    ingresar: () => '/ingresar',
    /** AUTH-05 y AUTH-06 (aún sin pantalla). */
    recuperarClave: () => '/recuperar',
    nuevaClave: () => '/nueva-clave',
    onboarding: (bloque: string, paso?: number) => `/onboarding/${bloque}${paso ? `/${paso}` : ''}`,
    perfilPublico: (id: string, ver?: 'trabajo' | 'servicios' | 'clases') => `/u/${id}${q({ ver })}`,
    organizacion: (id: string) => `/o/${id}`,
    /** GES-05 · Trabajadores favoritos (aún sin pantalla). */
    favoritos: (orgId: string) => `/o/${orgId}/favoritos`,
    /** PRF-06 · Equipo (F3, aún sin pantalla). */
    equipo: (orgId: string) => `/o/${orgId}/equipo`,
    /** PRF-04 · Agregar un perfil y PRF-05 · Mis perfiles (aún sin pantalla). */
    agregarPerfil: () => '/perfil/agregar',
    misPerfiles: () => '/perfil/mis-perfiles',
    verificacion: () => '/verificacion',
    /** VER-04 · Verificar organización (aún sin pantalla). */
    verificarOrganizacion: (orgId: string) => `/verificacion/organizacion/${orgId}`,
    configuracion: () => '/configuracion',
    /** CFG-02 a CFG-05 (aún sin pantalla; Apariencia es hoy la hoja `?sheet=apariencia` de CFG-01). */
    configuracionCuenta: () => '/configuracion/cuenta',
    configuracionNotificaciones: () => '/configuracion/notificaciones',
    configuracionPrivacidad: () => '/configuracion/privacidad',
    configuracionApariencia: () => '/configuracion/apariencia',
    /** CFG-06 · Eliminar cuenta (también durante el onboarding; aún sin pantalla). */
    eliminarCuenta: () => '/eliminar-cuenta',
    terminos: () => '/terminos',
    privacidad: () => '/privacidad',
    ayuda: () => '/ayuda',
    soporte: () => '/soporte',

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

/** ¿Es la raíz de una pestaña (lleva TabBar)? `/explorar` sí; `/mensajes/123` no. */
export function isTabRoot(pathname: string): boolean {
    const parts = pathname.split('/').filter(Boolean);
    return parts.length === 1 && tabOf(pathname) !== null;
}
