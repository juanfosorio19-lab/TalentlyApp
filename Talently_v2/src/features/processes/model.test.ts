import { afterEach, describe, expect, it } from 'vitest';
import { buildIcs } from '../../domain/calendario';
import { getApplications, getProcess, getPublication } from '../demo/data';
import { getManageState, resetManage, setApplicantStatus } from '../demo/manageState';
import { getSessionState, startsWithoutApplication } from '../demo/sessionStore';
import type { DemoActorId } from '../demo/session';
import type { DemoApplication, DemoProcessStep, DemoShiftBlock } from '../demo/types';
import {
    HIRED,
    addMinutes,
    atLocal,
    canMarkHired,
    canWithdraw,
    demoNow,
    googleCalendarUrl,
    hiringApplicantOf,
    hiringView,
    interviewEvent,
    isApplicantView,
    parseWhen,
    processStatus,
    publicationPath,
    resolveProcess,
    resolveReview,
    shiftHasEnded,
    shiftRole,
    stepsAsOf,
    timelineSteps,
} from './model';

const proc = (id: string) => {
    const p = getProcess(id);
    if (!p) throw new Error(`Falta el proceso ${id} en la demo`);
    return p;
};

describe('resolveProcess', () => {
    /** Las postulaciones de los datos, ya enviadas en la sesión (también las del inicio de los flujos). */
    const applied = (actorId: DemoActorId) => getApplications(actorId);
    /** Sesión nueva: sin las que el prototipo muestra antes de postular (useApplications). */
    const fresh = (actorId: DemoActorId) =>
        getApplications(actorId).filter((a) => !startsWithoutApplication(actorId, a.publicationId));
    const processId = (t: ReturnType<typeof resolveProcess>) => (t.kind === 'process' ? t.process.id : t.kind);

    it('abre el proceso de quien lo mira, por id de proceso o de postulación', () => {
        expect(processId(resolveProcess('proc-jorge-guardia-4x4', 'jorge', applied('jorge')))).toBe('proc-jorge-guardia-4x4');
        expect(processId(resolveProcess('app-jorge-guardia-4x4', 'jorge', applied('jorge')))).toBe('proc-jorge-guardia-4x4');
        expect(processId(resolveProcess('proc-carolina-marta', 'carolina', []))).toBe('proc-carolina-marta');
    });

    it('no muestra el proceso de otra cuenta ni nada a Jorge recién registrado', () => {
        expect(resolveProcess('proc-jorge-guardia-4x4', 'pedro', applied('pedro')).kind).toBe('not-found');
        expect(resolveProcess('proc-jorge-guardia-4x4', 'jorge', [], true).kind).toBe('not-found');
        expect(resolveProcess('no-existe', 'jorge', applied('jorge')).kind).toBe('not-found');
    });

    it('sigue a la sesión: antes de postular (flujos 2 y 3) no hay proceso, sino la publicación', () => {
        expect(resolveProcess('proc-pedro-mecanico', 'pedro', fresh('pedro'))).toEqual({
            kind: 'not-applied',
            publicationId: 'empleo-mecanico-automotriz',
        });
        // Jorge (flujos 8 y 11) parte con sus postulaciones de los datos.
        expect(processId(resolveProcess('app-jorge-guardia-4x4', 'jorge', fresh('jorge')))).toBe('proc-jorge-guardia-4x4');
        expect(processId(resolveProcess('proc-jorge-guardia-noche', 'jorge', fresh('jorge')))).toBe('proc-jorge-guardia-noche');
        // Después de postular en la sesión, PRC-01 la muestra.
        expect(processId(resolveProcess('proc-pedro-mecanico', 'pedro', applied('pedro')))).toBe('proc-pedro-mecanico');
    });
});

describe('timelineSteps', () => {
    it('copia los pasos del proceso tal cual (PRC-01)', () => {
        const steps = timelineSteps(proc('proc-jorge-guardia-4x4'), false);
        expect(steps.map((s) => [s.label, s.status, s.date])).toEqual([
            ['Postulado', 'done', '7 dic · 21:14'],
            ['Visto', 'done', '8 dic · 09:40'],
            ['En proceso', 'done', '9 dic · 17:05'],
            ['Entrevista', 'current', 'mar 15 dic · 10:00'],
            ['Oferta', 'pending', undefined],
            ['Contratado', 'pending', undefined],
        ]);
    });

    it('al retirar deja lo que ya pasó y cierra con «Postulación retirada» (la entrevista agendada no pasó)', () => {
        const steps = timelineSteps(proc('proc-jorge-guardia-4x4'), true);
        expect(steps.map((s) => s.label)).toEqual(['Postulado', 'Visto', 'En proceso']);
        expect(steps.every((s) => s.status === 'done')).toBe(true);
        expect(steps.map((s) => s.badge)).toEqual([undefined, undefined, 'Postulación retirada']);
    });

    it('al retirar, una etapa actual que ya pasó («En proceso · hoy») queda hecha', () => {
        const steps = timelineSteps(proc('proc-jorge-guardia-noche'), true);
        expect(steps.map((s) => s.label)).toEqual(['Postulado', 'Visto', 'En proceso']);
        expect(steps.at(-1)?.badge).toBe('Postulación retirada');
    });

    it('mantiene el cierre negativo de los datos («No seleccionado»)', () => {
        expect(timelineSteps(proc('proc-jorge-supervisor'), false).at(-1)?.badge).toBe('No seleccionado');
    });
});

describe('retirar postulación', () => {
    it('solo quien postuló, con la postulación en pie', () => {
        expect(canWithdraw(proc('proc-jorge-guardia-4x4'), false)).toBe(true);
        expect(canWithdraw(proc('proc-jorge-guardia-4x4'), true)).toBe(false);
        expect(canWithdraw(proc('proc-jorge-supervisor'), false)).toBe(false);
        expect(canWithdraw(proc('proc-carolina-marta'), false)).toBe(false);
    });

    it('el Badge pasa a «Postulación retirada»', () => {
        expect(processStatus(proc('proc-pedro-mecanico'), false)).toBe('Entrevista');
        expect(processStatus(proc('proc-pedro-mecanico'), true)).toBe('Postulación retirada');
    });

    it('quien postuló ve el detalle; quien contrata, la gestión de su aviso', () => {
        expect(isApplicantView(proc('proc-pedro-mecanico'))).toBe(true);
        expect(isApplicantView(proc('proc-carolina-marta'))).toBe(false);
        expect(publicationPath(proc('proc-pedro-mecanico'))).toBe('/p/empleo-mecanico-automotriz');
        expect(publicationPath(proc('proc-carolina-marta'))).toBe('/publicaciones/aviso-asesor-hogar');
    });
});

describe('entrevista al calendario', () => {
    it('entiende «mar 15 dic · 10:00» con el año de la demo', () => {
        expect(parseWhen('mar 15 dic · 10:00')).toBe('2026-12-15T10:00');
        expect(parseWhen('lun 14 dic · 09:00')).toBe('2026-12-14T09:00');
        // Un mes que ya pasó es del año siguiente.
        expect(parseWhen('lun 4 ene · 9:30')).toBe('2027-01-04T09:30');
        expect(parseWhen('Av. Concha y Toro 1234')).toBeNull();
    });

    it('suma la duración cruzando el día', () => {
        expect(addMinutes('2026-12-15T10:00', 60)).toBe('2026-12-15T11:00');
        expect(addMinutes('2026-12-31T23:30', 60)).toBe('2027-01-01T00:30');
    });

    it('arma un .ics válido de la entrevista de Jorge', () => {
        const p = proc('proc-jorge-guardia-4x4');
        const event = p.entrevista ? interviewEvent(p, p.entrevista) : null;
        expect(event).toMatchObject({
            title: 'Entrevista con Seguridad Andes Ltda.',
            start: '2026-12-15T10:00',
            end: '2026-12-15T11:00',
            location: 'Av. Concha y Toro 1234, Puente Alto',
        });
        const ics = buildIcs(event!, new Date(Date.UTC(2026, 11, 10, 16)));
        expect(ics).toContain('DTSTART:20261215T100000');
        expect(ics).toContain('DTSTAMP:20261210T160000Z');
        expect(googleCalendarUrl(event!)).toContain('dates=20261215T100000/20261215T110000');
    });
});

describe('resolveReview', () => {
    const matias = { id: 'matias' as const };
    const apps = getApplications('matias');

    it('la notificación «Evalúa tu turno del sáb 5 dic» abre REV-01 como en el prototipo', () => {
        const target = resolveReview('turno-garzones-finde-5dic', matias, apps);
        expect(target.kind).toBe('review');
        if (target.kind !== 'review') return;
        expect(target.subject.counterpart.nombre).toBe('Banquetería Rosa SpA');
        expect(target.subject.linea).toBe('Turno · Garzón · sáb 5 dic');
        expect(target.subject.fecha).toBe('sáb 5 dic');
        expect(target.subject.pregunta).toBe('¿Cómo te fue con la organización?');
        expect(target.subject.tags).toEqual(['Pago a tiempo']);
    });

    it('desde TUR-01 (id de la postulación confirmada) evalúa ese turno cuando terminó', () => {
        const after = atLocal('2026-12-11', '00:30');
        const target = resolveReview('app-matias-coctel', matias, apps, false, after);
        expect(target.kind === 'review' && target.subject.linea).toBe('Turno · Garzón · jue 10 dic');
        expect(target.kind === 'review' && target.subject.publicationId).toBe('turno-garzones-coctel-corporativo');
        expect(resolveReview('turno-garzones-coctel-corporativo', matias, apps, false, after).kind).toBe('review');
    });

    it('un turno confirmado que todavía no termina no se evalúa (jue 10 dic, 13:00 en la demo)', () => {
        expect(resolveReview('app-matias-coctel', matias, apps).kind).toBe('not-worked');
        expect(resolveReview('turno-garzones-coctel-corporativo', matias, apps).kind).toBe('not-worked');
        expect(resolveReview('app-jorge-eventos-12dic', { id: 'jorge' }, getApplications('jorge')).kind).toBe('not-worked');
        expect(resolveReview('turno-guardia-eventos-12dic', { id: 'jorge' }, getApplications('jorge')).kind).toBe('not-worked');
        // Justo a la hora de término ya se evalúa.
        expect(resolveReview('app-matias-coctel', matias, apps, false, atLocal('2026-12-11', '00:00')).kind).toBe('review');
        expect(resolveReview('app-matias-coctel', matias, apps, false, atLocal('2026-12-10', '23:59')).kind).toBe('not-worked');
    });

    it('un turno solo postulado, cancelado o de otra persona no se evalúa', () => {
        expect(resolveReview('app-matias-matrimonio', matias, apps).kind).toBe('not-worked');
        const cancelled: DemoApplication[] = apps.map((a) => (a.id === 'app-matias-coctel' ? { ...a, estado: 'Cancelaste' } : a));
        expect(resolveReview('app-matias-coctel', matias, cancelled).kind).toBe('not-worked');
        expect(resolveReview('turno-garzones-finde-5dic', { id: 'pedro' }, getApplications('pedro')).kind).toBe('not-worked');
        expect(resolveReview('empleo-guardia-4x4', { id: 'jorge' }, getApplications('jorge')).kind).toBe('not-worked');
    });

    it('quien publicó evalúa en los cupos del turno (GES-04)', () => {
        expect(resolveReview('turno-garzones-finde-5dic', { id: 'banqueteria' }, [])).toEqual({
            kind: 'owner',
            path: '/publicaciones/turno-garzones-finde-5dic/turnos/finde-sab-5',
        });
    });

    it('sin datos: EmptyState honesto', () => {
        expect(resolveReview('no-existe', matias, apps).kind).toBe('not-found');
        expect(resolveReview('turno-garzones-finde-5dic', { id: 'jorge' }, [], true).kind).toBe('not-found');
    });

    it('el oficio sale de la conversación del turno o del oficio principal', () => {
        expect(shiftRole('matias', 'turno-garzones-finde-5dic')).toBe('Garzón');
        expect(shiftRole('jorge', 'turno-guardia-eventos-12dic')).toBeTruthy();
    });
});

describe('shiftHasEnded', () => {
    const block = (b: Partial<DemoShiftBlock>): DemoShiftBlock => ({
        id: 'b',
        weekday: 'jue',
        day: 10,
        month: 'dic',
        time: '19:00–00:00',
        duration: '5 h',
        ...b,
    });

    it('hoy en la demo es jue 10 dic 2026 a las 13:00', () => {
        expect(demoNow()).toBe(atLocal('2026-12-10', '13:00'));
    });

    it('un turno que cruza la medianoche termina al día siguiente', () => {
        expect(shiftHasEnded(block({}))).toBe(false);
        expect(shiftHasEnded(block({}), atLocal('2026-12-11', '00:00'))).toBe(true);
        expect(shiftHasEnded(block({ day: 12, weekday: 'sáb', time: '18:00–02:00' }), atLocal('2026-12-13', '01:59'))).toBe(false);
    });

    it('los turnos pasados de la demo ya terminaron', () => {
        const pub = getPublication('turno-garzones-finde-5dic');
        const first = pub?.tipo === 'turno' ? pub.bloques[0] : undefined;
        expect(first && shiftHasEnded(first)).toBe(true);
        expect(shiftHasEnded(block({ day: 10, time: '08:00–12:00' }))).toBe(true);
    });

    it('sin horario que se entienda no se da por terminado', () => {
        expect(shiftHasEnded(block({ time: 'por confirmar' }), atLocal('2027-06-01', '00:00'))).toBe(false);
    });
});

describe('PRC-01 de quien contrata (flujo 5)', () => {
    afterEach(() => resetManage());

    const marta = () => proc('proc-carolina-marta');
    const statusNow = () => hiringApplicantOf(marta(), getManageState(), getSessionState().applications)?.estado;

    it('un paso «hecho» con fecha futura todavía no pasa: queda como el actual, con su fecha', () => {
        // El final del flujo 5 en PRC-01-hogar del prototipo, visto el jue 10 dic a las 13:00.
        const final: DemoProcessStep[] = [
            { etapa: 'Postulado', estado: 'done', fecha: '8 dic · 20:15' },
            { etapa: 'Visto', estado: 'done', fecha: '9 dic · 19:10' },
            { etapa: 'En proceso', estado: 'done', fecha: '9 dic · 19:20' },
            { etapa: 'Entrevista', estado: 'done', fecha: 'vie 11 dic · 10:00' },
            { etapa: 'Oferta', estado: 'done', fecha: 'vie 11 dic · 12:30' },
            { etapa: 'Contratado', estado: 'done', fecha: 'lun 14 dic · 09:15' },
        ];
        const steps = stepsAsOf(final);
        expect(steps.map((s) => [s.etapa, s.estado, s.fecha])).toEqual([
            ['Postulado', 'done', '8 dic · 20:15'],
            ['Visto', 'done', '9 dic · 19:10'],
            ['En proceso', 'done', '9 dic · 19:20'],
            ['Entrevista', 'current', 'vie 11 dic · 10:00'],
            ['Oferta', 'pending', undefined],
            ['Contratado', 'pending', undefined],
        ]);
        // Lo que ya pasó no cambia (PRC-01 de Jorge), ni lo que no trae día y hora (la entrevista por coordinar con Marta).
        expect(stepsAsOf(proc('proc-jorge-guardia-4x4').pasos)).toEqual(proc('proc-jorge-guardia-4x4').pasos);
        expect(stepsAsOf(marta().pasos)).toEqual(marta().pasos);
    });

    it('dice lo mismo que GES-02 y el chat: «En proceso», con la entrevista por coordinar y sin checklist', () => {
        expect(statusNow()).toBe('En proceso');
        const view = hiringView(marta(), statusNow());
        expect(view.estado).toBe('En proceso');
        expect(view.checklist).toBeUndefined();
        expect(timelineSteps(view, false).find((s) => s.status === 'current')).toMatchObject({
            label: 'Entrevista',
            date: 'por coordinar',
        });
        expect(canMarkHired(marta(), statusNow())).toBe(true);
    });

    it('al marcarla «Contratado» (el mismo estado de GES-02) aparece el checklist y el último paso es de hoy', () => {
        const person = hiringApplicantOf(marta(), getManageState(), getSessionState().applications);
        if (!person) throw new Error('Marta no está en GES-02');
        setApplicantStatus('aviso-asesor-hogar', person.personId, HIRED);
        expect(statusNow()).toBe('Contratado');
        const view = hiringView(marta(), statusNow());
        expect(view.estado).toBe('Contratado');
        expect(view.checklist?.titulo).toBe('Para contratar como corresponde');
        expect(view.pasos.map((s) => [s.etapa, s.estado, s.fecha])).toEqual([
            ['Postulado', 'done', '8 dic · 20:15'],
            ['Visto', 'done', '9 dic · 19:10'],
            ['En proceso', 'done', '9 dic · 19:20'],
            ['Contratado', 'done', 'hoy · 13:00'],
        ]);
        expect(canMarkHired(marta(), statusNow())).toBe(false);
    });

    it('no seleccionada en GES-02: cierra con el Badge en el último paso que pasó', () => {
        const view = hiringView(marta(), 'No seleccionado');
        expect(view.pasos.map((s) => [s.etapa, s.badge])).toEqual([
            ['Postulado', undefined],
            ['Visto', undefined],
            ['En proceso', 'No seleccionado'],
        ]);
        expect(view.checklist).toBeUndefined();
        expect(canMarkHired(marta(), 'No seleccionado')).toBe(false);
    });

    it('quien postuló ve su proceso tal cual', () => {
        const pedro = proc('proc-pedro-mecanico');
        expect(hiringApplicantOf(pedro, getManageState(), getSessionState().applications)).toBeUndefined();
        expect(hiringView(pedro, undefined)).toBe(pedro);
        expect(canMarkHired(pedro, undefined)).toBe(false);
    });
});
