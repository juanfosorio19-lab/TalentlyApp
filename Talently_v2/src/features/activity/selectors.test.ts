import { afterEach, describe, expect, it } from 'vitest';
import { buildIcs } from '../../domain/calendario';
import { getApplication, getApplications, getNotifications } from '../demo/data';
import { getManageState, resetManage, setApplicantStatus } from '../demo/manageState';
import { DEMO_ACTORS } from '../demo/session';
import {
    applyTo,
    cancelShift,
    getSessionState,
    isWithdrawn,
    keyOf,
    resetSession,
    reviewedBy,
    sendReview,
    startsWithoutApplication,
    withdrawApplication,
} from '../demo/sessionStore';
import type { DemoApplication } from '../demo/types';
import {
    TODAY,
    WEEK_END,
    WEEK_START,
    agendaFor,
    agendaParamsFix,
    applicationPath,
    eventLabel,
    googleCalendarUrl,
    groupByDay,
    groupOf,
    hasEnded,
    hiringStatusLookup,
    icsFileName,
    isoFromDayText,
    metricLine,
    pendingReviewsFor,
    publicationsFor,
    publisherFor,
    resolveSegment,
    shiftCalendarEvent,
    sortShiftsByStart,
    shiftWindow,
    toEventData,
    whenText,
    type ManagedSession,
    type ManagedSessionOf,
} from './selectors';

const NOT_NEW = { recienRegistrado: false };

/**
 * Lo mismo que hace useApplications de demo/sessionStore (sin React): las de
 * los datos sin las que el actor aún no postuló, con lo cancelado y lo
 * retirado al día.
 */
function sessionApplications(actorId: keyof typeof DEMO_ACTORS): DemoApplication[] {
    const { applications, cancelledShifts } = getSessionState();
    return getApplications(actorId)
        .filter((a) => !startsWithoutApplication(actorId, a.publicationId) || applications.has(keyOf(actorId, a.publicationId)))
        .map((a) => {
            if (cancelledShifts.has(a.id)) return { ...a, estado: 'Cancelaste' };
            const appliedAt = applications.get(keyOf(actorId, a.publicationId))?.at;
            if (a.processId && isWithdrawn(actorId, a.processId, appliedAt)) return { ...a, estado: 'Postulación retirada' };
            return a;
        });
}

afterEach(() => {
    resetSession();
    resetManage();
});

/** Lo que GES-01 y GES-04 cambiaron en la sesión, por publicación. */
const sessionOf =
    (changes: Record<string, ManagedSession>): ManagedSessionOf =>
    (publicationId) =>
        changes[publicationId];

describe('fechas de la demo', () => {
    it('hoy es el jue 10 dic 2026 y la semana va de lunes a domingo', () => {
        expect(TODAY).toBe('2026-12-10');
        expect(WEEK_START).toBe('2026-12-07');
        expect(WEEK_END).toBe('2026-12-13');
    });

    it('un enero visto en diciembre es del año siguiente', () => {
        expect(isoFromDayText('lun 4 ene')).toBe('2027-01-04');
        expect(isoFromDayText('sáb 12 dic')).toBe('2026-12-12');
    });
});

describe('segmentos', () => {
    it('Matías y Jorge abren en Postulaciones; la organización en Agenda', () => {
        expect(resolveSegment(DEMO_ACTORS.matias, false, null).seg).toBe('postulaciones');
        expect(resolveSegment(DEMO_ACTORS.jorge, false, null).seg).toBe('postulaciones');
        expect(resolveSegment(DEMO_ACTORS.banqueteria, true, null).seg).toBe('agenda');
        expect(resolveSegment(DEMO_ACTORS.carolina, true, null).seg).toBe('publicaciones');
    });

    it('un ?seg que no aplica al actor cae en el de apertura', () => {
        expect(resolveSegment(DEMO_ACTORS.banqueteria, true, 'postulaciones').seg).toBe('agenda');
        expect(resolveSegment(DEMO_ACTORS.matias, false, 'publicaciones').seg).toBe('postulaciones');
        expect(resolveSegment(DEMO_ACTORS.matias, false, 'agenda').seg).toBe('agenda');
    });
});

describe('ACT-02 · a dónde lleva cada postulación', () => {
    it('turno confirmado → TUR-01; empleo → PRC-01; turno postulado → DET-01', () => {
        const coctel = getApplication('app-matias-coctel');
        const noche = getApplication('app-jorge-guardia-noche');
        const cena = getApplication('app-matias-cena');
        expect(coctel && applicationPath(coctel)).toBe('/turnos/app-matias-coctel');
        expect(noche && applicationPath(noche)).toBe('/procesos/proc-jorge-guardia-noche');
        expect(cena && applicationPath(cena)).toBe('/p/turno-garzones-cena-fin-de-ano');
    });
});

describe('ACT-02 · orden de los turnos', () => {
    it('van por fecha y hora de inicio, también el que se toma en la sesión (flujo 2)', () => {
        applyTo('matias', 'turno-garzones-matrimonio', 'Postulado');
        const matias = sessionApplications('matias').filter((a) => a.tipo === 'turno');
        expect(sortShiftsByStart(matias).map((a) => a.id)).toEqual(['app-matias-coctel', 'app-matias-matrimonio', 'app-matias-cena']);
        // useApplications agrega arriba la que no viene en los datos: «Garzones para cóctel de lanzamiento», sáb 12 dic 19:00.
        const lanzamiento: DemoApplication = {
            ...(matias[0] as DemoApplication),
            id: 'sesion-turno-coctel-lanzamiento',
            publicationId: 'turno-coctel-lanzamiento',
            miTurno: undefined,
            estado: 'Postulado',
        };
        expect(sortShiftsByStart([lanzamiento, ...matias]).map((a) => a.id)).toEqual([
            'app-matias-coctel',
            'app-matias-matrimonio',
            'sesion-turno-coctel-lanzamiento',
            'app-matias-cena',
        ]);
    });

    it('sin fecha conocida, al final y en el orden en que llegaron', () => {
        const [first] = sessionApplications('matias');
        if (!first) throw new Error('sin postulaciones');
        const unknown = { ...first, id: 'x', publicationId: 'no-existe', miTurno: undefined };
        expect(sortShiftsByStart([unknown, first]).map((a) => a.id)).toEqual([first.id, 'x']);
    });
});

describe('ACT-01 · Agenda', () => {
    it('recién registrado, vacía', () => {
        expect(agendaFor(DEMO_ACTORS.jorge, sessionApplications('jorge'), { recienRegistrado: true })).toEqual([]);
    });

    it('Pedro parte sin la entrevista del flujo 3 y la ve al postular', () => {
        expect(agendaFor(DEMO_ACTORS.pedro, sessionApplications('pedro'), NOT_NEW)).toEqual([]);
        applyTo('pedro', 'empleo-mecanico-automotriz', 'Postulado');
        const items = agendaFor(DEMO_ACTORS.pedro, sessionApplications('pedro'), NOT_NEW);
        expect(items.map((i) => i.id)).toEqual(['ag-pedro-entrevista']);
        // Sin hora de término: no se inventa una.
        expect(items[0]?.end).toBeUndefined();
        expect(items[0]?.target).toEqual({ pantalla: 'proceso', processId: 'proc-pedro-mecanico' });
    });

    it('Matías ve su turno de hoy y su postulación pendiente; al postular en el flujo 2, también esa', () => {
        const before = agendaFor(DEMO_ACTORS.matias, sessionApplications('matias'), NOT_NEW);
        expect(before.map((i) => [i.date, i.status])).toEqual([
            ['2026-12-10', 'Confirmado'],
            ['2026-12-18', 'Postulado'],
        ]);
        applyTo('matias', 'turno-garzones-matrimonio', 'Postulado');
        const after = agendaFor(DEMO_ACTORS.matias, sessionApplications('matias'), NOT_NEW);
        expect(after.map((i) => i.date)).toEqual(['2026-12-10', '2026-12-12', '2026-12-18']);
    });

    it('al retirar la postulación en PRC-01, la entrevista sale de la Agenda (y vuelve si postula de nuevo)', () => {
        applyTo('pedro', 'empleo-mecanico-automotriz', 'Postulado');
        const appliedAt = getSessionState().applications.get(keyOf('pedro', 'empleo-mecanico-automotriz'))?.at ?? 0;
        withdrawApplication('pedro', 'proc-pedro-mecanico', appliedAt + 1000);
        expect(sessionApplications('pedro').map((a) => a.estado)).toEqual(['Postulación retirada']);
        expect(agendaFor(DEMO_ACTORS.pedro, sessionApplications('pedro'), NOT_NEW)).toEqual([]);
        // Vuelve a postular después de retirar (DET-01): la entrevista vuelve.
        withdrawApplication('pedro', 'proc-pedro-mecanico', appliedAt - 1000);
        expect(agendaFor(DEMO_ACTORS.pedro, sessionApplications('pedro'), NOT_NEW).map((i) => i.id)).toEqual(['ag-pedro-entrevista']);
    });

    it('Carolina ve la entrevista con Marta hasta que la marca «Contratado» en PRC-01 (flujo 5)', () => {
        const lookup = () => hiringStatusLookup(getManageState(), getSessionState().applications);
        const ids = () => agendaFor(DEMO_ACTORS.carolina, [], NOT_NEW, undefined, lookup()).map((i) => i.id);
        expect(lookup()('proc-carolina-marta')).toBe('En proceso');
        expect(ids()).toContain('ag-carolina-entrevista');
        setApplicantStatus('aviso-asesor-hogar', 'marta', 'Contratado');
        expect(lookup()('proc-carolina-marta')).toBe('Contratado');
        expect(ids()).not.toContain('ag-carolina-entrevista');
    });

    it('un turno cancelado en TUR-01 sale de la Agenda', () => {
        cancelShift('app-matias-coctel');
        const items = agendaFor(DEMO_ACTORS.matias, sessionApplications('matias'), NOT_NEW);
        expect(items.some((i) => i.id === 'ag-matias-coctel')).toBe(false);
    });

    it('la organización ve la cobertura de cada turno y abre sus cupos (GES-04)', () => {
        const items = agendaFor(DEMO_ACTORS.banqueteria, [], NOT_NEW);
        const coctel = items.find((i) => i.id === 'ag-br-coctel');
        expect(coctel?.where).toMatch(/^\d+\/\d+ confirmados$/);
        expect(coctel?.target).toEqual({ pantalla: 'cupos', publicationId: 'turno-garzones-coctel-corporativo', bloqueId: 'coctel-jue-10' });
    });

    it('la cobertura y el estado de un turno salen de lo confirmado en la sesión (GES-04)', () => {
        const before = agendaFor(DEMO_ACTORS.banqueteria, [], NOT_NEW).find((i) => i.id === 'ag-br-matrimonio');
        expect(before?.where).toBe('5/8 confirmados');
        expect(before?.status).toBe('Activa');
        // «Confirmar a mis favoritos (2)» en GES-04: 7/8, igual que GES-04 e INI-02.
        const confirmed = sessionOf({ 'turno-garzones-matrimonio': { confirmados: new Map([['matrimonio-sab-12', 7]]) } });
        const after = agendaFor(DEMO_ACTORS.banqueteria, [], NOT_NEW, confirmed).find((i) => i.id === 'ag-br-matrimonio');
        expect(after?.where).toBe('7/8 confirmados');
        expect(after?.status).toBe('Activa');
        const full = sessionOf({ 'turno-garzones-matrimonio': { confirmados: new Map([['matrimonio-sab-12', 8]]) } });
        expect(agendaFor(DEMO_ACTORS.banqueteria, [], NOT_NEW, full).find((i) => i.id === 'ag-br-matrimonio')?.status).toBe(
            'Cupos completos',
        );
        const paused = sessionOf({ 'turno-garzones-matrimonio': { estado: 'Pausada' } });
        const item = agendaFor(DEMO_ACTORS.banqueteria, [], NOT_NEW, paused).find((i) => i.id === 'ag-br-matrimonio');
        expect(item?.status).toBe('Pausada');
        expect(item?.where).toBe('5/8 confirmados');
    });

    it('la URL dice el día y la vista que se ven (un ?dia o una ?vista que no aplican se corrigen)', () => {
        expect(agendaParamsFix('2027-01-01', 'dia', TODAY)).toEqual({ dia: TODAY });
        expect(agendaParamsFix('hola', null, TODAY)).toEqual({ dia: TODAY });
        expect(agendaParamsFix(null, 'mes', TODAY)).toEqual({ vista: 'semana' });
        expect(agendaParamsFix('2027-01-01', 'mes', TODAY)).toEqual({ dia: TODAY, vista: 'semana' });
        expect(agendaParamsFix('2026-12-12', 'dia', '2026-12-12')).toEqual({});
        expect(agendaParamsFix(null, 'semana', TODAY)).toEqual({});
        expect(agendaParamsFix(null, null, TODAY)).toEqual({});
    });

    it('va en orden de fecha y hora, y se agrupa por día', () => {
        const items = agendaFor(DEMO_ACTORS.banqueteria, [], NOT_NEW);
        const keys = items.map((i) => `${i.date} ${i.start}`);
        expect(keys).toEqual([...keys].sort());
        const groups = groupByDay(items);
        expect(groups.map((g) => g.date)).toEqual([...new Set(items.map((i) => i.date))]);
    });

    it('sin hora de término: solo el inicio, en la pantalla y en el nombre accesible', () => {
        applyTo('pedro', 'empleo-mecanico-automotriz', 'Postulado');
        const [interview] = agendaFor(DEMO_ACTORS.pedro, sessionApplications('pedro'), NOT_NEW);
        if (!interview) throw new Error('sin entrevista');
        expect(whenText(interview)).toBe('lun 14 dic · 09:00');
        expect(toEventData(interview).end).toBe('');
        expect(eventLabel(interview)).toContain('lun 14 dic a las 09:00');
        const [shift] = agendaFor(DEMO_ACTORS.matias, sessionApplications('matias'), NOT_NEW);
        expect(shift && eventLabel(shift)).toBeUndefined();
        expect(shift && whenText(shift)).toBe('jue 10 dic · 19:00–00:00');
    });
});

describe('ACT-03 · Publicaciones', () => {
    it('Carolina publica como su hogar y la organización con su nombre', () => {
        const carolina = publicationsFor(DEMO_ACTORS.carolina, NOT_NEW);
        expect(carolina.length).toBeGreaterThan(0);
        expect(publisherFor(DEMO_ACTORS.carolina, carolina)).toBe('Familia en Ñuñoa');
        const org = publicationsFor(DEMO_ACTORS.banqueteria, NOT_NEW);
        expect(publisherFor(DEMO_ACTORS.banqueteria, org)).toBe('Banquetería Rosa SpA');
    });

    it('una publicación pausada en GES-01 pasa a «Pausadas» con su estado y sus métricas de la sesión', () => {
        const bartender = publicationsFor(DEMO_ACTORS.banqueteria, NOT_NEW).find((p) => p.id === 'empleo-bartender');
        if (bartender?.kind !== 'managed') throw new Error('sin Bartender');
        expect(groupOf(bartender)).toBe('activas');
        expect(metricLine(bartender.managed)).toBe('5 postulantes · sin revisar');

        const changed = sessionOf({
            'empleo-bartender': {
                estado: 'Pausada',
                metricas: [
                    { label: 'Vistas', valor: '96' },
                    { label: 'Postulantes', valor: '5', detalle: '3 nuevos' },
                ],
            },
        });
        const after = publicationsFor(DEMO_ACTORS.banqueteria, NOT_NEW, changed).find((p) => p.id === 'empleo-bartender');
        if (after?.kind !== 'managed') throw new Error('sin Bartender');
        expect(after.managed.estado).toBe('Pausada');
        expect(groupOf(after)).toBe('pausadas');
        expect(metricLine(after.managed)).toBe('5 postulantes · 3 nuevos');
        // Las demás quedan como en los datos.
        const others = publicationsFor(DEMO_ACTORS.banqueteria, NOT_NEW, changed).filter((p) => p.id !== 'empleo-bartender');
        expect(others).toEqual(publicationsFor(DEMO_ACTORS.banqueteria, NOT_NEW).filter((p) => p.id !== 'empleo-bartender'));
    });
});

describe('TUR-01 · Mi turno', () => {
    it('un turno que cruza la medianoche termina al día siguiente', () => {
        const shift = getApplication('app-jorge-eventos-12dic')?.miTurno;
        const w = shift && shiftWindow(shift.bloque);
        expect(w).toEqual({ date: '2026-12-12', start: '18:00', endDate: '2026-12-13', end: '02:00' });
    });

    it('el turno de hoy a las 19:00 aún no termina (son las 13:00 en la demo)', () => {
        const shift = getApplication('app-matias-coctel')?.miTurno;
        const w = shift && shiftWindow(shift.bloque);
        expect(w && hasEnded(w)).toBe(false);
        expect(hasEnded({ date: '2026-12-05', start: '18:00', endDate: '2026-12-06', end: '00:00' })).toBe(true);
    });

    it('el .ics sale de buildIcs con DTSTAMP y el término al día siguiente', () => {
        const event = shiftCalendarEvent(
            'app-matias-coctel',
            'Garzones para cóctel corporativo',
            { date: '2026-12-10', start: '19:00', endDate: '2026-12-11', end: '00:00' },
            'Av. Providencia 1650, Providencia',
        );
        const ics = buildIcs(event, new Date(Date.UTC(2026, 11, 10, 16, 0, 0)));
        expect(ics).toContain('DTSTAMP:20261210T160000Z');
        expect(ics).toContain('DTSTART:20261210T190000');
        expect(ics).toContain('DTEND:20261211T000000');
        expect(ics).toContain('LOCATION:Av. Providencia 1650\\, Providencia');
        expect(googleCalendarUrl(event)).toContain('dates=20261210T190000/20261211T000000');
    });

    it('el archivo se llama como el turno, sin caracteres que el sistema no acepta', () => {
        expect(icsFileName('Supervisor/a de guardias')).toBe('Mi turno - Supervisor-a de guardias.ics');
        expect(icsFileName('Garzones para cóctel en Ñuñoa')).toBe('Mi turno - Garzones para coctel en Nunoa.ics');
    });

    it('Matías tiene por evaluar el turno del sáb 5 dic (REV-01), no el que está mirando', () => {
        const reviews = pendingReviewsFor(getNotifications('matias'), 'matias', 'turno-garzones-coctel-corporativo');
        expect(reviews).toEqual([
            {
                id: 'not-matias-evaluar',
                title: 'Evalúa tu turno del sáb 5 dic',
                from: 'Banquetería Rosa SpA',
                publicationId: 'turno-garzones-finde-5dic',
                target: { pantalla: 'evaluar', publicationId: 'turno-garzones-finde-5dic' },
            },
        ]);
        expect(pendingReviewsFor(getNotifications('matias'), 'matias', 'turno-garzones-finde-5dic')).toEqual([]);
        expect(pendingReviewsFor(getNotifications('jorge'), 'jorge')).toEqual([]);
    });

    it('con la evaluación enviada en REV-01 (demo/sessionStore), ya no se pide de nuevo', () => {
        sendReview('matias', 'turno-garzones-finde-5dic', { rating: 5, tags: [], comment: '' });
        const reviewed = reviewedBy(getSessionState().reviews, 'matias');
        expect(reviewed).toEqual(new Set(['turno-garzones-finde-5dic']));
        expect(reviewedBy(getSessionState().reviews, 'jorge').size).toBe(0);
        expect(pendingReviewsFor(getNotifications('matias'), 'matias', 'turno-garzones-coctel-corporativo', reviewed)).toEqual([]);
    });
});
