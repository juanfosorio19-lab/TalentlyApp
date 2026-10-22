import { describe, expect, it } from 'vitest';
import { buildIcs } from '../../domain/calendario';
import { getApplications, getProcess } from '../demo/data';
import type { DemoApplication } from '../demo/types';
import {
    addMinutes,
    canWithdraw,
    googleCalendarUrl,
    interviewEvent,
    isApplicantView,
    parseWhen,
    processStatus,
    publicationPath,
    resolveProcess,
    resolveReview,
    shiftRole,
    timelineSteps,
} from './model';

const proc = (id: string) => {
    const p = getProcess(id);
    if (!p) throw new Error(`Falta el proceso ${id} en la demo`);
    return p;
};

describe('resolveProcess', () => {
    it('abre el proceso de quien lo mira, por id de proceso o de postulación', () => {
        expect(resolveProcess('proc-jorge-guardia-4x4', 'jorge')?.id).toBe('proc-jorge-guardia-4x4');
        expect(resolveProcess('app-jorge-guardia-4x4', 'jorge')?.id).toBe('proc-jorge-guardia-4x4');
        expect(resolveProcess('proc-carolina-marta', 'carolina')?.id).toBe('proc-carolina-marta');
    });

    it('no muestra el proceso de otra cuenta ni nada a Jorge recién registrado', () => {
        expect(resolveProcess('proc-jorge-guardia-4x4', 'pedro')).toBeNull();
        expect(resolveProcess('proc-jorge-guardia-4x4', 'jorge', true)).toBeNull();
        expect(resolveProcess('no-existe', 'jorge')).toBeNull();
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

    it('desde TUR-01 (id de la postulación confirmada) evalúa ese turno', () => {
        const target = resolveReview('app-matias-coctel', matias, apps);
        expect(target.kind === 'review' && target.subject.linea).toBe('Turno · Garzón · jue 10 dic');
        expect(target.kind === 'review' && target.subject.publicationId).toBe('turno-garzones-coctel-corporativo');
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
