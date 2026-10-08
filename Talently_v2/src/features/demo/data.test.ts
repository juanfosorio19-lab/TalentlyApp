import { describe, expect, it } from 'vitest';
import { DEMO_ACTORS, type DemoActorId } from './session';
import {
    DEMO_AGENDA,
    DEMO_APPLICATIONS,
    DEMO_CONVERSATIONS,
    DEMO_EXPLORE,
    DEMO_MANAGED_PUBLICATIONS,
    DEMO_NOTIFICATIONS,
    DEMO_ORG_DASHBOARDS,
    DEMO_ORGS,
    DEMO_PERSONS,
    DEMO_PROCESSES,
    DEMO_PROFILES,
    DEMO_PUBLICATIONS,
    getApplication,
    getApplications,
    getConversation,
    getConversations,
    getExplore,
    getHomeFeed,
    getManagedPublication,
    getNotifications,
    getOrg,
    getOrgDashboard,
    getPerson,
    getProcess,
    getProfile,
    getPublication,
} from './data';

const ACTOR_IDS = Object.keys(DEMO_ACTORS) as DemoActorId[];
const VIEWER_IDS: string[] = [...ACTOR_IDS, 'marta'];

/** Todo lo que la demo puede mostrar, incluidos los Inicio armados por actor. */
const TODO = {
    orgs: DEMO_ORGS,
    personas: DEMO_PERSONS,
    // (no se llama «publicaciones»: esa clave es la de las listas de ids que se revisan abajo)
    todasLasPublicaciones: DEMO_PUBLICATIONS,
    postulaciones: DEMO_APPLICATIONS,
    procesos: DEMO_PROCESSES,
    conversaciones: DEMO_CONVERSATIONS,
    notificaciones: DEMO_NOTIFICATIONS,
    agenda: DEMO_AGENDA,
    gestion: DEMO_MANAGED_PUBLICATIONS,
    paneles: DEMO_ORG_DASHBOARDS,
    perfiles: DEMO_PROFILES,
    explorar: DEMO_EXPLORE,
    inicios: [...ACTOR_IDS.map((id) => getHomeFeed(id)), getHomeFeed('jorge', { recienRegistrado: true })],
};

type Visit = (key: string, value: unknown, parent: object) => void;

/** Recorre todo el árbol (una vez por objeto) y llama a `visit` con cada clave y su valor. */
function walk(node: unknown, visit: Visit, seen = new Set<unknown>()): void {
    if (node === null || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    for (const [key, value] of Object.entries(node)) {
        visit(key, value, node);
        walk(value, visit, seen);
    }
}

function allStrings(): string[] {
    const out: string[] = [];
    walk(TODO, (_k, v) => {
        if (typeof v === 'string') out.push(v);
    });
    return out;
}

describe('Inicio por actor', () => {
    it('cada actor de la sesión tiene su Inicio con al menos un bloque', () => {
        for (const id of ACTOR_IDS) {
            const feed = getHomeFeed(id);
            expect(feed.actorId).toBe(id);
            expect(feed.saludo).toMatch(/^Hola, \S/);
            expect(feed.bloques.length).toBeGreaterThan(0);
        }
    });

    it('los contadores de campana y Mensajes son los de cada prototipo', () => {
        const esperado: Record<DemoActorId, [number, number]> = {
            matias: [2, 3], // Main
            jorge: [2, 1], // ACT-02, MSG-01-jorge, PRF-01
            pedro: [2, 1], // EXP-01
            carolina: [1, 2], // INI-01-carolina
            rosa: [2, 0], // INI-01-rosa
            banqueteria: [2, 3], // INI-02
        };
        for (const id of ACTOR_IDS) {
            const feed = getHomeFeed(id);
            expect([feed.notificacionesSinLeer, feed.mensajesSinLeer], id).toEqual(esperado[id]);
        }
        const nuevo = getHomeFeed('jorge', { recienRegistrado: true });
        expect([nuevo.notificacionesSinLeer, nuevo.mensajesSinLeer]).toEqual([0, 0]);
        expect(nuevo.bloques.map((b) => b.tipo)).toEqual(['vacio', 'completar']);
    });

    it('cada actor tiene Explorar y Perfil', () => {
        for (const id of ACTOR_IDS) {
            expect(getExplore(id).actorId).toBe(id);
            expect(getProfile(id).actorId).toBe(id);
        }
    });

    it('los bloques de Inicio y Explorar listan publicaciones del tipo correcto', () => {
        const tipoDe = (id: string) => getPublication(id)?.tipo;
        for (const id of ACTOR_IDS) {
            for (const b of getHomeFeed(id).bloques) {
                if (b.tipo === 'turnos') b.publicaciones.forEach((p) => expect(tipoDe(p), p).toBe('turno'));
                if (b.tipo === 'empleos') b.publicaciones.forEach((p) => expect(tipoDe(p), p).toBe('empleo'));
            }
            const exp = getExplore(id);
            exp.empleos.publicaciones.forEach((p) => expect(tipoDe(p), p).toBe('empleo'));
            exp.turnos.dias.forEach((d) => d.publicaciones.forEach((p) => expect(tipoDe(p), p).toBe('turno')));
        }
    });

    it('Rosa y Banquetería Rosa SpA comparten la bandeja de notificaciones (flujo 7)', () => {
        expect(getNotifications('banqueteria')).toEqual(getNotifications('rosa'));
        expect(getNotifications('rosa').some((n) => n.actorId === 'banqueteria')).toBe(true);
        expect(getOrgDashboard('banqueteria')).toBeDefined();
    });
});

describe('Referencias', () => {
    it('todo id referenciado existe', () => {
        const rotos: string[] = [];
        const check = (ok: boolean, what: string) => {
            if (!ok) rotos.push(what);
        };
        walk(TODO, (key, value, parent) => {
            if (key === 'publicationId' && typeof value === 'string') {
                const pub = getPublication(value);
                check(Boolean(pub), `publicationId ${value}`);
                const bloqueId = (parent as { bloqueId?: unknown }).bloqueId;
                if (typeof bloqueId === 'string') {
                    check(pub?.tipo === 'turno' && pub.bloques.some((b) => b.id === bloqueId), `bloqueId ${bloqueId}`);
                }
            }
            if (key === 'conversationId' && typeof value === 'string') check(Boolean(getConversation(value)), `conversationId ${value}`);
            if (key === 'processId' && typeof value === 'string') check(Boolean(getProcess(value)), `processId ${value}`);
            if (key === 'applicationId' && typeof value === 'string') check(Boolean(getApplication(value)), `applicationId ${value}`);
            if (key === 'personId' && typeof value === 'string') check(Boolean(getPerson(value)), `personId ${value}`);
            if (key === 'personIds' && Array.isArray(value)) {
                value.forEach((p) => check(typeof p === 'string' && Boolean(getPerson(p)), `personIds ${String(p)}`));
            }
            if (key === 'publicaciones' && Array.isArray(value)) {
                value.forEach((p) => check(typeof p === 'string' && Boolean(getPublication(p)), `publicaciones ${String(p)}`));
            }
            if ((key === 'viewerId' || key === 'actorId') && typeof value === 'string') {
                check(VIEWER_IDS.includes(value), `${key} ${value}`);
            }
            if (key === 'ownerId' && typeof value === 'string') check(value in DEMO_ACTORS, `ownerId ${value}`);
            if (key === 'orgId' && typeof value === 'string') check(Boolean(getOrg(value)), `orgId ${value}`);
        });
        expect(rotos).toEqual([]);
    });

    it('los ids son únicos en cada colección', () => {
        const colecciones: Record<string, string[]> = {
            orgs: DEMO_ORGS.map((o) => o.id),
            personas: DEMO_PERSONS.map((p) => p.id),
            publicaciones: DEMO_PUBLICATIONS.map((p) => p.id),
            postulaciones: DEMO_APPLICATIONS.map((a) => a.id),
            procesos: DEMO_PROCESSES.map((p) => p.id),
            conversaciones: DEMO_CONVERSATIONS.map((c) => c.id),
            notificaciones: DEMO_NOTIFICATIONS.map((n) => n.id),
            agenda: DEMO_AGENDA.map((e) => e.id),
            gestion: DEMO_MANAGED_PUBLICATIONS.map((m) => m.publicationId),
        };
        for (const [nombre, ids] of Object.entries(colecciones)) {
            expect(new Set(ids).size, nombre).toBe(ids.length);
        }
    });

    it('postulaciones, procesos y conversaciones son de quien las mira', () => {
        for (const a of DEMO_APPLICATIONS) {
            if (!a.processId) continue;
            const proc = getProcess(a.processId);
            expect(proc?.viewerId, a.id).toBe(a.actorId);
            expect(proc?.publicationId, a.id).toBe(a.publicationId);
        }
        for (const id of ACTOR_IDS) {
            getApplications(id).forEach((a) => expect(a.actorId).toBe(id));
            getConversations(id).forEach((c) => expect(c.viewerId).toBe(id));
        }
    });

    it('el panel lista publicaciones propias con su gestión, y los cupos calzan con los bloques', () => {
        for (const panel of DEMO_ORG_DASHBOARDS) {
            for (const id of panel.publicaciones) {
                const gestion = getManagedPublication(id);
                expect(gestion, id).toBeDefined();
                expect(getPublication(id)?.autor.id, id).toBe(panel.orgId);
            }
        }
        for (const m of DEMO_MANAGED_PUBLICATIONS) {
            const pub = getPublication(m.publicationId);
            expect(pub, m.publicationId).toBeDefined();
            for (const roster of m.cupos ?? []) {
                expect(pub?.tipo === 'turno' && pub.bloques.some((b) => b.id === roster.id), roster.id).toBe(true);
                expect(roster.confirmados.length, roster.id).toBeLessThanOrEqual(roster.total);
            }
        }
    });

    it('los cupos de la tarjeta de un turno son la suma de sus bloques', () => {
        for (const p of DEMO_PUBLICATIONS) {
            if (p.tipo !== 'turno') continue;
            expect(p.bloques.length, p.id).toBeGreaterThan(0);
            const conCupos = p.bloques.filter((b) => b.cupos);
            if (conCupos.length !== p.bloques.length) continue;
            const left = conCupos.reduce((s, b) => s + (b.cupos?.left ?? 0), 0);
            const total = conCupos.reduce((s, b) => s + (b.cupos?.total ?? 0), 0);
            expect({ left, total }, p.id).toEqual(p.cupos);
        }
    });
});

describe('Textos y montos', () => {
    it('ningún texto usa palabras prohibidas ni códigos con guion bajo', () => {
        const prohibidas = new Set([
            'email', 'emails', 'like', 'nope', 'nana', 'nanas', 'empleada', 'empleadas',
            'mucama', 'mucamas', 'niñera', 'niñeras', 'babysitter', 'babysitters',
        ]);
        const malos = allStrings().filter((s) =>
            s
                .toLowerCase()
                .split(/[^\p{L}\p{N}_]+/u)
                .some((palabra) => prohibidas.has(palabra) || palabra.includes('_')),
        );
        expect(malos).toEqual([]);
    });

    it('los montos son enteros positivos en CLP', () => {
        const montos: unknown[] = [];
        walk(TODO, (_k, v) => {
            if (v && typeof v === 'object' && 'value' in v && 'unit' in v) montos.push((v as { value: unknown }).value);
        });
        expect(montos.length).toBeGreaterThan(0);
        const malos = montos.filter((m) => typeof m !== 'number' || !Number.isInteger(m) || m <= 0);
        expect(malos).toEqual([]);
    });

    it('las distancias usan el formato «a 3 km · Ñuñoa»', () => {
        const conKm = DEMO_PUBLICATIONS.map((p) => p.lugar).filter((l) => l.includes('km'));
        expect(conKm.length).toBeGreaterThan(0);
        conKm.forEach((l) => expect(l).toMatch(/^a \d+ km · \S/));
    });
});
