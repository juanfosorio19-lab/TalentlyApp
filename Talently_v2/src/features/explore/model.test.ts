import { afterEach, describe, expect, it } from 'vitest';
import { getExplore, getPublication } from '../demo/data';
import { arrive, getManageState, resetManage, setPublicationStatus } from '../demo/manageState';
import { DEMO_ACTORS } from '../demo/session';
import type { DemoTurno } from '../demo/types';
import { EMPLEO_SIN_FILTROS, TURNO_SIN_FILTROS } from './filters';
import {
    deckAndList,
    empleosOf,
    membersOf,
    ownPublications,
    passesEmpleo,
    personasFor,
    personCard,
    porQueOf,
    replacesFrom,
    searchHints,
    searchIn,
    searchScope,
    segmentFor,
    segmentsOf,
    sinPerfiles,
    suggestionId,
    suggestionPath,
    turnoCta,
    turnoDays,
    type CardHandlers,
    type Decided,
} from './model';

const noApplications = new Map();
const manage = () => getManageState();

afterEach(() => resetManage());
const handlers: CardHandlers = { href: '#', onOpen: () => undefined, onVerify: () => undefined };

const turno = (id: string) => getPublication(id) as DemoTurno;

describe('segmentos de Explorar (spec §5.2)', () => {
    it('cada actor ve los suyos', () => {
        expect(segmentsOf(DEMO_ACTORS.matias, false, manage())).toEqual(['empleo', 'turno']);
        expect(segmentsOf(DEMO_ACTORS.banqueteria, false, manage())).toEqual(['personas']);
        expect(segmentsOf(DEMO_ACTORS.carolina, false, manage())).toEqual(['personas']);
        expect(segmentsOf(DEMO_ACTORS.rosa, false, manage())).toEqual(['empleo', 'turno']);
    });

    it('un segmento que no aplica cae en el del actor', () => {
        const segs = segmentsOf(DEMO_ACTORS.matias, false, manage());
        expect(segmentFor(DEMO_ACTORS.matias, segs, 'personas')).toBe('turno');
        expect(segmentFor(DEMO_ACTORS.matias, segs, 'empleo')).toBe('empleo');
        expect(segmentFor(DEMO_ACTORS.pedro, segmentsOf(DEMO_ACTORS.pedro, false, manage()), null)).toBe('empleo');
    });

    it('Jorge recién registrado no tiene publicaciones propias', () => {
        expect(ownPublications(DEMO_ACTORS.jorge, true, manage())).toEqual([]);
        expect(segmentsOf(DEMO_ACTORS.jorge, true, manage())).not.toContain('personas');
    });
});

describe('EXP-01 · deck y lista', () => {
    const empleos = empleosOf(getExplore('pedro'));

    it('lo decidido no vuelve al deck; la lista solo esconde «No me interesa»', () => {
        const decisions: Record<string, Decided> = {
            'empleo-mecanico-automotriz': 'postulado',
            'empleo-mantencion-flota': 'no',
        };
        const { deck, list } = deckAndList(empleos, (id) => decisions[id]);
        expect(deck.map((p) => p.id)).toEqual(['empleo-electromecanico']);
        expect(list.map((p) => p.id)).toEqual(['empleo-mecanico-automotriz', 'empleo-electromecanico']);
    });

    it('sin filtros pasan todas', () => {
        expect(empleos.every((p) => passesEmpleo(p, EMPLEO_SIN_FILTROS))).toBe(true);
    });
});

describe('EXP-02 · turnos por día', () => {
    it('agrupa por día y filtra por oficio y fecha, sin días vacíos', () => {
        const explore = getExplore('matias');
        const todos = turnoDays(explore, [], TURNO_SIN_FILTROS);
        expect(todos.map((d) => d.titulo)).toEqual(['Hoy', 'Mañana', 'Este fin de semana', 'Más adelante']);
        const garzon = turnoDays(explore, ['Garzón'], TURNO_SIN_FILTROS);
        expect(garzon.map((d) => d.titulo)).toEqual(['Este fin de semana']);
        const hoy = turnoDays(explore, [], { ...TURNO_SIN_FILTROS, fechas: ['Hoy'] });
        expect(hoy.map((d) => d.turnos.map((t) => t.id))).toEqual([['turno-bodega-noche']]);
    });

    it('el CTA es el de DET-01: tomar, lista de espera sin cupos o ver postulaciones', () => {
        const t = turno('turno-garzones-matrimonio');
        expect(turnoCta(t, undefined)).toBe('tomar');
        expect(turnoCta({ ...t, cupos: { left: 0, total: 8 } }, undefined)).toBe('espera');
        expect(turnoCta(t, 'postulado')).toBe('postulado');
    });
});

describe('EXP-05 · personas sugeridas', () => {
    it('«Por qué ves esto» habla del oficio, nunca del título de la publicación', () => {
        expect(porQueOf(undefined, 'Maipú', 'San Miguel')).toBe('calza con el oficio que buscas');
        expect(porQueOf(undefined, 'San Miguel', 'San Miguel')).toBe('calza con el oficio que buscas y vive en San Miguel');
        expect(porQueOf('sáb 5 dic', 'San Miguel', 'San Miguel')).toBe('calza con el oficio que buscas y ya trabajó contigo el sáb 5 dic');
        const pub = ownPublications(DEMO_ACTORS.banqueteria, false, manage())[0];
        expect(pub).toBeDefined();
        const estado = pub ? personasFor(DEMO_ACTORS.banqueteria, pub, noApplications, manage()) : null;
        if (estado?.tipo === 'sugeridas') {
            for (const s of estado.sugeridas) expect(s.porQue).not.toContain(pub?.titulo ?? '');
        }
    });
});

describe('EXP-05 · quienes ya están en la publicación', () => {
    it('los postulados que llegan después del «salto de tiempo» todavía no están (como en GES-04)', () => {
        const members = membersOf('turno-garzones-finde', noApplications, manage());
        for (const id of ['martin-silva', 'fernanda-castro', 'nicolas-vargas', 'antonia-reyes']) expect(members.has(id)).toBe(false);
        const pub = getPublication('turno-garzones-finde');
        const estado = pub ? personasFor(DEMO_ACTORS.banqueteria, pub, noApplications, manage()) : null;
        expect(estado?.tipo).toBe('sugeridas');
        if (estado?.tipo === 'sugeridas') expect(estado.sugeridas.map((s) => s.person.id)).toContain('martin-silva');
    });

    it('después del «salto de tiempo» (GES-04) los postulados ya están y no se sugieren', () => {
        arrive('turno-garzones-finde', 'finde-sab-19');
        const members = membersOf('turno-garzones-finde', noApplications, manage());
        expect(members.get('martin-silva')?.kind).toBe('postulado');
        const pub = getPublication('turno-garzones-finde');
        const estado = pub ? personasFor(DEMO_ACTORS.banqueteria, pub, noApplications, manage()) : null;
        if (estado?.tipo === 'sugeridas') expect(estado.sugeridas.map((s) => s.person.id)).not.toContain('martin-silva');
    });

    it('pausar o cerrar en GES-01 la saca de EXP-05 y de la búsqueda', () => {
        expect(ownPublications(DEMO_ACTORS.banqueteria, false, manage()).map((p) => p.id)).toContain('turno-garzones-finde');
        setPublicationStatus('turno-garzones-finde', { estado: 'Pausada' });
        expect(ownPublications(DEMO_ACTORS.banqueteria, false, manage()).map((p) => p.id)).not.toContain('turno-garzones-finde');
        const matias = searchScope(DEMO_ACTORS.matias, false, noApplications, manage());
        expect(matias.turnos.map((p) => p.id)).not.toContain('turno-garzones-finde');
    });
});

describe('EXP-07 · buscar', () => {
    const scopeOf = (id: keyof typeof DEMO_ACTORS) => searchScope(DEMO_ACTORS[id], false, noApplications, manage());

    it('sin tildes y con sinónimos', () => {
        expect(searchIn(scopeOf('pedro'), 'mecanico').empleos.length).toBeGreaterThan(0);
        const matias = scopeOf('matias');
        expect(searchIn(matias, 'mesero').turnos.length).toBeGreaterThan(0);
        expect(searchIn(matias, '   ').turnos).toEqual([]);
    });

    it('la forma femenina, el plural y las palabras del catálogo de oficios también encuentran', () => {
        const matias = scopeOf('matias');
        for (const q of ['garzona', 'Garzonas', 'camarero']) expect(searchIn(matias, q).turnos.length).toBeGreaterThan(0);
        const jorge = scopeOf('jorge');
        for (const q of ['nochero', 'OS-10']) {
            const r = searchIn(jorge, q);
            expect(r.turnos.length + r.empleos.length).toBeGreaterThan(0);
        }
        expect(searchIn(scopeOf('banqueteria'), 'garzonas').personas.length).toBeGreaterThan(0);
    });

    it('la búsqueda es global, sin las publicaciones propias; quien contrata también busca personas', () => {
        const carolina = scopeOf('carolina');
        const own = new Set(ownPublications(DEMO_ACTORS.carolina, false, manage()).map((p) => p.id));
        expect(own.size).toBeGreaterThan(0);
        expect([...carolina.empleos, ...carolina.turnos].some((p) => own.has(p.id))).toBe(false);
        expect(searchIn(carolina, 'nana').personas.length).toBeGreaterThan(0);
        expect(searchIn(scopeOf('banqueteria'), 'garzon').personas.length).toBeGreaterThan(0);
    });

    it('lo decidido en EXP-05 manda: «No me interesa» la saca y a quien invitaste lo dice', () => {
        const pub = 'turno-garzones-finde';
        const decisions: Record<string, Decided> = {
            [suggestionId(pub, 'javiera-contreras')]: 'si',
            [suggestionId(pub, 'felipe-araya')]: 'no',
        };
        const scope = searchScope(DEMO_ACTORS.banqueteria, false, noApplications, manage(), (id) => decisions[id]);
        const javiera = searchIn(scope, 'javiera').personas.find((s) => s.person.id === 'javiera-contreras');
        expect(javiera?.invitada).toBe(true);
        expect(javiera?.publicationId).toBe(pub);
        if (javiera) {
            expect(personCard(javiera, handlers, { publicacion: true }).tags?.[0]?.label).toBe(
                'Invitaste a postular a Garzones fin de semana',
            );
            expect(suggestionPath(javiera)).toBe('/u/javiera-contreras?ver=trabajo');
        }
        const felipe = searchIn(scope, 'felipe').personas.find((s) => s.person.id === 'felipe-araya');
        expect(felipe?.publicationId).not.toBe(pub);
    });

    it('sin perfiles (Rosa) ve cómo empezar antes de escribir', () => {
        expect(sinPerfiles(DEMO_ACTORS.rosa)).toBe(true);
        expect(sinPerfiles(DEMO_ACTORS.matias)).toBe(false);
        expect(sinPerfiles(DEMO_ACTORS.banqueteria)).toBe(false);
    });

    it('las pistas de «No encontramos…» salen de lo que sí se encuentra', () => {
        const hints = searchHints(scopeOf('matias'));
        expect(hints.length).toBeGreaterThan(0);
        for (const h of hints) {
            const r = searchIn(scopeOf('matias'), h);
            expect(r.turnos.length + r.empleos.length).toBeGreaterThan(0);
        }
    });
});

describe('navegar desde Explorar (spec §5.3)', () => {
    it('la raíz de otra pestaña con replace; desde Buscar, Explorar con push', () => {
        expect(replacesFrom('/explorar', '/inicio')).toBe(true);
        expect(replacesFrom('/buscar', '/actividad?seg=postulaciones')).toBe(true);
        expect(replacesFrom('/buscar', '/explorar?tipo=personas&p=turno-garzones-finde')).toBe(false);
        expect(replacesFrom('/explorar', '/explorar?tipo=turno')).toBe(true);
        expect(replacesFrom('/explorar', '/p/turno-bodega-noche')).toBe(false);
        expect(replacesFrom('/buscar', '/publicaciones/turno-garzones-finde/turnos/finde-sab-19?ver=postulados')).toBe(false);
    });
});
