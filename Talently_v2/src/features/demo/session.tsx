// Sesión de DEMOSTRACIÓN del rediseño v3 mientras Supabase está pausado
// (docs/PENDIENTES.md #9). Las pantallas leen el actor de aquí; cuando
// vuelva la base de datos, este módulo se reemplaza por Auth + Actor reales
// (02-arquitectura §4.2, providers/) sin tocar las pantallas.
// Personas y datos: los de los flujos del prototipo de Claude Design (flujos.json).
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type DemoActorId = 'matias' | 'jorge' | 'pedro' | 'carolina' | 'rosa' | 'banqueteria';

export interface DemoActor {
    id: DemoActorId;
    /** Nombre que se muestra en saludos y AppBar («Hola, Matías»). */
    shortName: string;
    fullName: string;
    kind: 'persona' | 'organizacion';
    comuna: string;
    /** Capacidades activas (spec §5.2): qué bloques ve en Inicio y qué segmentos en Explorar/Actividad. */
    capabilities: Array<'empleo' | 'turnos' | 'hogar' | 'organizacion'>;
    /** Organizaciones a las que pertenece (habilita el selector de actor en Inicio y Perfil). */
    orgs?: DemoActorId[];
    /** Para una organización: la persona que la administra. */
    owner?: DemoActorId;
    /** Flujo del prototipo donde aparece. */
    flow: string;
}

export const DEMO_ACTORS: Record<DemoActorId, DemoActor> = {
    matias: {
        id: 'matias', shortName: 'Matías', fullName: 'Matías Rojas', kind: 'persona', comuna: 'Maipú',
        capabilities: ['turnos'], flow: '2 · Matías toma un turno',
    },
    jorge: {
        id: 'jorge', shortName: 'Jorge', fullName: 'Jorge Muñoz', kind: 'persona', comuna: 'Puente Alto',
        capabilities: ['empleo', 'turnos', 'hogar'], flow: '1 · Onboarding de Jorge · 11 · Impulsa tu perfil',
    },
    pedro: {
        id: 'pedro', shortName: 'Pedro', fullName: 'Pedro Valdés', kind: 'persona', comuna: 'Macul',
        capabilities: ['empleo'], flow: '3 · Pedro postula y hace match',
    },
    carolina: {
        id: 'carolina', shortName: 'Carolina', fullName: 'Carolina', kind: 'persona', comuna: 'Ñuñoa',
        capabilities: ['hogar'], flow: '5 · Carolina publica su aviso',
    },
    rosa: {
        id: 'rosa', shortName: 'Rosa', fullName: 'Rosa Muñoz', kind: 'persona', comuna: 'Providencia',
        capabilities: ['turnos'], orgs: ['banqueteria'], flow: '7 · Cambio de actor',
    },
    banqueteria: {
        id: 'banqueteria', shortName: 'Banquetería Rosa', fullName: 'Banquetería Rosa SpA', kind: 'organizacion',
        comuna: 'Providencia', capabilities: ['organizacion'], owner: 'rosa', flow: '4 · Rosa publica un turno',
    },
};

interface DemoSession {
    actor: DemoActor;
    setActor: (id: DemoActorId) => void;
    /** Actores entre los que puede cambiar (SHT-ACTOR): la persona y sus organizaciones. */
    switchable: DemoActor[];
}

const Ctx = createContext<DemoSession | null>(null);

function initialActor(): DemoActorId {
    // ?demo=jorge en la URL (antes o después del #) elige el actor de demostración.
    const fromUrl =
        new URLSearchParams(window.location.search).get('demo') ??
        new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('demo');
    return fromUrl && fromUrl in DEMO_ACTORS ? (fromUrl as DemoActorId) : 'matias';
}

export function DemoSessionProvider({ children }: { children: ReactNode }) {
    const [actorId, setActorId] = useState<DemoActorId>(initialActor);
    const setActor = useCallback((id: DemoActorId) => setActorId(id), []);
    const value = useMemo<DemoSession>(() => {
        const actor = DEMO_ACTORS[actorId];
        const person = actor.owner ? DEMO_ACTORS[actor.owner] : actor;
        const switchable = [person, ...(person.orgs ?? []).map((o) => DEMO_ACTORS[o])];
        return { actor, setActor, switchable };
    }, [actorId, setActor]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemoSession(): DemoSession {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useDemoSession debe usarse dentro de <DemoSessionProvider>');
    return ctx;
}
