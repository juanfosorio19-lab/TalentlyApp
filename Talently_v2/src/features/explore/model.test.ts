import { describe, expect, it } from 'vitest';
import { getExplore, getPublication } from '../demo/data';
import { DEMO_ACTORS } from '../demo/session';
import type { DemoTurno } from '../demo/types';
import { EMPLEO_SIN_FILTROS, TURNO_SIN_FILTROS } from './filters';
import {
    deckAndList,
    empleosOf,
    isEmptyScope,
    ownPublications,
    passesEmpleo,
    personasFor,
    porQueOf,
    searchHints,
    searchIn,
    searchScope,
    segmentFor,
    segmentsOf,
    turnoCta,
    turnoDays,
    type Decided,
} from './model';

const turno = (id: string) => getPublication(id) as DemoTurno;

describe('segmentos de Explorar (spec §5.2)', () => {
    it('cada actor ve los suyos', () => {
        expect(segmentsOf(DEMO_ACTORS.matias)).toEqual(['empleo', 'turno']);
        expect(segmentsOf(DEMO_ACTORS.banqueteria)).toEqual(['personas']);
        expect(segmentsOf(DEMO_ACTORS.carolina)).toEqual(['personas']);
        expect(segmentsOf(DEMO_ACTORS.rosa)).toEqual(['empleo', 'turno']);
    });

    it('un segmento que no aplica cae en el del actor', () => {
        const segs = segmentsOf(DEMO_ACTORS.matias);
        expect(segmentFor(DEMO_ACTORS.matias, segs, 'personas')).toBe('turno');
        expect(segmentFor(DEMO_ACTORS.matias, segs, 'empleo')).toBe('empleo');
        expect(segmentFor(DEMO_ACTORS.pedro, segmentsOf(DEMO_ACTORS.pedro), null)).toBe('empleo');
    });

    it('Jorge recién registrado no tiene publicaciones propias', () => {
        expect(ownPublications(DEMO_ACTORS.jorge, true)).toEqual([]);
        expect(segmentsOf(DEMO_ACTORS.jorge, true)).not.toContain('personas');
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
        const pub = ownPublications(DEMO_ACTORS.banqueteria)[0];
        expect(pub).toBeDefined();
        const estado = pub ? personasFor(DEMO_ACTORS.banqueteria, pub) : null;
        if (estado?.tipo === 'sugeridas') {
            for (const s of estado.sugeridas) expect(s.porQue).not.toContain(pub?.titulo ?? '');
        }
    });
});

describe('EXP-07 · buscar', () => {
    it('sin tildes y con sinónimos', () => {
        const pedro = searchScope(DEMO_ACTORS.pedro);
        expect(searchIn(pedro, 'mecanico').empleos.length).toBeGreaterThan(0);
        const matias = searchScope(DEMO_ACTORS.matias);
        expect(searchIn(matias, 'mesero').turnos.length).toBeGreaterThan(0);
        expect(searchIn(matias, '   ').turnos).toEqual([]);
    });

    it('quien contrata busca personas (también las que ya postularon)', () => {
        const carolina = searchScope(DEMO_ACTORS.carolina);
        expect(carolina.empleos).toEqual([]);
        expect(searchIn(carolina, 'nana').personas.length).toBeGreaterThan(0);
        expect(searchIn(searchScope(DEMO_ACTORS.banqueteria), 'garzon').personas.length).toBeGreaterThan(0);
    });

    it('sin nada que buscar (Rosa sin perfiles) el alcance queda vacío', () => {
        expect(isEmptyScope(searchScope(DEMO_ACTORS.rosa))).toBe(true);
    });

    it('las pistas de «No encontramos…» salen de lo que sí se encuentra', () => {
        const hints = searchHints(searchScope(DEMO_ACTORS.matias));
        expect(hints.length).toBeGreaterThan(0);
        for (const h of hints) {
            const r = searchIn(searchScope(DEMO_ACTORS.matias), h);
            expect(r.turnos.length + r.empleos.length).toBeGreaterThan(0);
        }
    });
});
