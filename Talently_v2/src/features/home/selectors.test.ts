import { describe, expect, it } from 'vitest';
import { EMPTY_STATE, type ConversationState } from '../demo/conversationState';
import { getApplications, getHomeFeed, getNotifications } from '../demo/data';
import type { DemoApplication, DemoNotification } from '../demo/types';
import { isoOf, publisherName } from './mock';
import { DEMO_ACTORS } from '../demo/session';
import {
    currentAgenda,
    deckTopId,
    groupNotifications,
    homeBlocks,
    needOf,
    publishKinds,
    resolveNotification,
    selectedKind,
    wizardOf,
    wizardOficio,
    wizardPath,
} from './selectors';

const notification = (id: string): DemoNotification => {
    const n = [...getNotifications('rosa'), ...getNotifications('matias')].find((x) => x.id === id);
    if (!n) throw new Error(`Falta la notificación ${id} en los datos`);
    return n;
};

const all = () => true;

describe('NOT-01 · grupos', () => {
    it('ordena Hoy, Ayer, Esta semana y Antes, sin grupos vacíos', () => {
        const groups = groupNotifications(getNotifications('rosa'));
        expect(groups.map((g) => g.grupo)).toEqual(['Hoy', 'Ayer', 'Esta semana', 'Antes']);
        expect(groups.flatMap((g) => g.items)).toHaveLength(6);
        expect(groupNotifications(getNotifications('carolina')).map((g) => g.grupo)).toEqual(['Hoy', 'Esta semana']);
        expect(groupNotifications([])).toEqual([]);
    });
});

describe('NOT-01 · destino de una notificación', () => {
    it('una notificación de Banquetería que Rosa abre como persona cambia de actor (flujo 7)', () => {
        const r = resolveNotification(notification('not-rosa-faltan-garzones'), 'rosa', ['rosa', 'banqueteria'], all);
        expect(r).toEqual({ switchTo: 'banqueteria', path: '/inicio' });
    });

    it('una del mismo actor no cambia de actor', () => {
        const r = resolveNotification(notification('not-rosa-identidad'), 'rosa', ['rosa', 'banqueteria'], all);
        expect(r).toEqual({ switchTo: undefined, path: '/verificacion' });
    });

    it('la ruta se calcula para el actor de la notificación (quien publicó evalúa en los cupos)', () => {
        const org = resolveNotification(notification('not-rosa-evaluar'), 'rosa', ['rosa', 'banqueteria'], all);
        expect(org.switchTo).toBe('banqueteria');
        expect(org.path).toMatch(/^\/publicaciones\/turno-garzones-finde-5dic/);
        const worker = resolveNotification(notification('not-matias-evaluar'), 'matias', ['matias'], all);
        expect(worker.path).toBe('/resena/turno-garzones-finde-5dic');
    });

    it('si la pantalla no existe, no hay ruta: «Disponible pronto» sin SYS-404', () => {
        const noManage = (path: string) => !path.startsWith('/publicaciones');
        const r = resolveNotification(notification('not-rosa-bartender'), 'rosa', ['rosa', 'banqueteria'], noManage);
        expect(r.path).toBeNull();
    });

    it('sin destino, no hay ruta', () => {
        const sinDestino: DemoNotification = { ...notification('not-rosa-identidad'), destino: undefined };
        expect(resolveNotification(sinDestino, 'rosa', ['rosa'], all).path).toBeNull();
    });
});

describe('INI-01 · bloques al día con la sesión', () => {
    const matias = getHomeFeed('matias').bloques;

    it('sin cambios en la sesión, los bloques son los de los datos', () => {
        const blocks = homeBlocks(matias, { applications: getApplications('matias'), cvSubido: false });
        expect(blocks.map((b) => b.tipo)).toEqual(matias.map((b) => b.tipo));
        const agenda = blocks.find((b) => b.tipo === 'agenda');
        expect(agenda?.tipo === 'agenda' && agenda.eventos).toHaveLength(1);
    });

    it('un turno cancelado en TUR-01 sale de «Hoy en tu agenda»', () => {
        const applications: DemoApplication[] = getApplications('matias').map((a) =>
            a.id === 'app-matias-coctel' ? { ...a, estado: 'Cancelaste' } : a,
        );
        const agenda = matias.find((b) => b.tipo === 'agenda');
        if (agenda?.tipo !== 'agenda') throw new Error('Main trae «Hoy en tu agenda»');
        expect(currentAgenda(agenda.eventos, applications)).toEqual([]);
    });

    it('«Te falta 1 cosa · Subir CV» no se muestra si ya subió el CV; otras tarjetas sí', () => {
        const jorge = getHomeFeed('jorge').bloques;
        const tips = (cvSubido: boolean) => homeBlocks(jorge, { applications: [], cvSubido }).filter((b) => b.tipo === 'completar');
        expect(tips(false)).toHaveLength(1);
        expect(tips(true)).toHaveLength(0);
        // La de Matías es un curso, no el CV.
        expect(homeBlocks(matias, { applications: [], cvSubido: true }).some((b) => b.tipo === 'completar')).toBe(true);
    });

    it('Marta (flujo 10): «te pidió tu certificado» cambia al compartirlo y al dejar de compartirlo', () => {
        const marta = getHomeFeed('marta').bloques;
        const detalle = (entries: ConversationState['entries']) => {
            const conversations = new Map([['conv-marta-familia', { ...EMPTY_STATE, entries }]]);
            const b = homeBlocks(marta, { applications: [], cvSubido: false, conversations }).find((x) => x.tipo === 'novedades');
            return b?.tipo === 'novedades' ? b.items[0]?.detalle : undefined;
        };
        expect(detalle([])).toBe('Familia en Ñuñoa · te pidió tu certificado de antecedentes');
        expect(detalle([{ kind: 'certificado', id: 'c1', off: false, hora: '13:00' }])).toBe(
            'Familia en Ñuñoa · compartiste tu certificado de antecedentes',
        );
        expect(detalle([{ kind: 'certificado', id: 'c1', off: true, hora: '13:00' }])).toBe(
            'Familia en Ñuñoa · dejaste de compartir tu certificado de antecedentes',
        );
    });

    it('Jorge recién registrado: sin actividad y con la credencial SPD', () => {
        const nuevo = homeBlocks(getHomeFeed('jorge', { recienRegistrado: true }).bloques, { applications: [], cvSubido: false });
        expect(nuevo.map((b) => b.tipo)).toEqual(['vacio', 'completar']);
    });
});

describe('PUBL-01', () => {
    it('cada actor ve sus opciones', () => {
        expect(publishKinds('organizacion')).toEqual(['empleo', 'turno']);
        expect(publishKinds('hogar')).toEqual(['hogar', 'evento']);
    });

    it('un tipo de la URL que no es del actor deja marcada la del prototipo', () => {
        expect(selectedKind('organizacion', null)).toBe('turno');
        expect(selectedKind('organizacion', 'hogar')).toBe('turno');
        expect(selectedKind('organizacion', 'empleo')).toBe('empleo');
        expect(selectedKind('hogar', 'turno')).toBe('hogar');
        expect(selectedKind('hogar', 'evento')).toBe('evento');
    });

    it('«Continuar» abre el asistente de la opción (un turno para un evento es un turno)', () => {
        expect(wizardOf('turno')).toBe('turno');
        expect(wizardOf('empleo')).toBe('empleo');
        expect(wizardOf('hogar')).toBe('hogar');
        expect(wizardOf('evento')).toBe('turno');
    });

    it('publica como la organización o como el hogar de su aviso', () => {
        expect(publisherName(DEMO_ACTORS.banqueteria, undefined)).toBe('Banquetería Rosa SpA');
        expect(publisherName(DEMO_ACTORS.carolina, 'aviso-asesor-hogar')).toBe('Familia en Ñuñoa');
        expect(publisherName(DEMO_ACTORS.carolina, undefined)).toBe('Carolina');
    });
});

describe('«¿Qué necesitas?» abre PUBL-01 con la necesidad ya puesta', () => {
    it('cada opción marca su tipo y el oficio con que parte el asistente', () => {
        expect(needOf('asesor-hogar')).toEqual({ tipo: 'hogar', oficio: 'asesor-hogar' });
        expect(needOf('cuidador-infantil')).toEqual({ tipo: 'hogar', oficio: 'cuidador-infantil' });
        expect(needOf('cuidador-adulto-mayor')).toEqual({ tipo: 'hogar', oficio: 'cuidador-adulto-mayor' });
        expect(needOf('banquetero-evento')).toEqual({ tipo: 'evento', oficio: 'banquetero' });
        expect(needOf('otra')).toEqual({ tipo: 'hogar' });
    });

    it('el oficio vale solo mientras siga marcada su opción', () => {
        expect(wizardOficio('hogar', 'cuidador-infantil')).toBe('cuidador-infantil');
        expect(wizardOficio('evento', 'banquetero')).toBe('banquetero');
        expect(wizardOficio('evento', 'cuidador-infantil')).toBeNull();
        expect(wizardOficio('hogar', 'banquetero')).toBeNull();
        expect(wizardOficio('hogar', 'gasfiter')).toBeNull();
        expect(wizardOficio('turno', null)).toBeNull();
    });

    it('«Continuar» lleva el oficio al paso 1 del asistente', () => {
        expect(wizardPath('hogar', 'cuidador-infantil')).toBe('/publicar/hogar/1?oficio=cuidador-infantil');
        expect(wizardPath('evento', 'banquetero')).toBe('/publicar/turno/1?oficio=banquetero');
        expect(wizardPath('evento', 'cuidador-infantil')).toBe('/publicar/turno/1');
        expect(wizardPath('turno', null)).toBe('/publicar/turno/1');
    });
});

describe('«Empleos para ti»: la tarjeta de arriba del deck', () => {
    const decided = (ids: Record<string, string>) => (id: string) => ids[id];

    it('la primera oferta del deck que aún no decide ni postuló', () => {
        const deck = ['empleo-guardia-4x4', 'empleo-conserje', 'empleo-supervisor-seguridad'];
        expect(deckTopId(deck, ['empleo-conserje'], decided({ 'empleo-guardia-4x4': 'postulado' }))).toBe('empleo-conserje');
        expect(deckTopId(deck, [], decided({}))).toBe('empleo-guardia-4x4');
        expect(deckTopId(deck, [], decided({ 'empleo-guardia-4x4': 'postulado', 'empleo-conserje': 'si' }))).toBe(
            'empleo-supervisor-seguridad',
        );
    });

    it('sin deck, la primera del bloque sin decidir; si decidió todas, no hay atajo', () => {
        expect(deckTopId([], ['a', 'b'], decided({ a: 'no' }))).toBe('b');
        expect(deckTopId(['a'], ['b'], decided({ a: 'si' }))).toBeUndefined();
    });
});

describe('fechas de la agenda', () => {
    it('«jue 10 dic» es el 10 de diciembre del año de la demo', () => {
        expect(isoOf('jue 10 dic', 2026)).toBe('2026-12-10');
        expect(isoOf('mar 1 sep', 2026)).toBe('2026-09-01');
    });
});
