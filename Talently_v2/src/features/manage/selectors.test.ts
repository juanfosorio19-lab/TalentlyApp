import { afterEach, describe, expect, it } from 'vitest';
import { getManagedPublication } from '../demo/data';
import { applyTo, resetSession, getSessionState } from '../demo/sessionStore';
import type { DemoManagedPublication } from '../demo/types';
import {
    applicantsOf,
    countNew,
    defaultRoster,
    expiryOf,
    favoritesText,
    filterSlug,
    isBeforeToday,
    joinWithA,
    matchesFilter,
    metricsOf,
    newDetail,
    parseDemoDate,
    publicationView,
    rosterView,
    todayPlus,
} from './selectors';
import {
    arrive,
    confirmPeople,
    evaluate,
    getManageState,
    renewPublication,
    resetManage,
    setApplicantStatus,
    setAttendance,
    setPublicationStatus,
} from './store';

function managed(id: string): DemoManagedPublication {
    const m = getManagedPublication(id);
    if (!m) throw new Error(`Sin ${id}`);
    return m;
}

const apps = () => getSessionState().applications;
const roster = (m: DemoManagedPublication, i = 0) => {
    const r = m.cupos?.[i];
    if (!r) throw new Error('Sin cupos');
    return r;
};

afterEach(() => {
    resetManage();
    resetSession();
});

describe('fechas de la demo (hoy jue 10 dic 2026)', () => {
    it('lee «sáb 19 dic» y «7 ene» con su año', () => {
        expect(parseDemoDate('sáb 19 dic')).toEqual({ day: 19, month: 11, year: 2026 });
        expect(parseDemoDate('7 ene')).toEqual({ day: 7, month: 0, year: 2027 });
        expect(parseDemoDate('sin fecha')).toBeNull();
    });

    it('el turno del sáb 5 dic ya pasó; el de hoy y los que vienen, no', () => {
        expect(isBeforeToday('sáb 5 dic')).toBe(true);
        expect(isBeforeToday('jue 10 dic')).toBe(false);
        expect(isBeforeToday('sáb 19 dic')).toBe(false);
    });

    it('renovar suma 30 días desde hoy y lee el vencimiento de la vigencia', () => {
        expect(todayPlus(30)).toBe('9 ene');
        expect(expiryOf('Publicada el 8 dic · hasta el 7 ene')).toBe('7 ene');
        expect(expiryOf('Terminó el sáb 5 dic')).toBeUndefined();
    });
});

describe('textos con nombres', () => {
    it('une los nombres como el prototipo', () => {
        expect(joinWithA(['Martín'])).toBe('Martín');
        expect(joinWithA(['Martín', 'Fernanda'])).toBe('Martín y a Fernanda');
        expect(joinWithA(['Martín', 'Fernanda', 'Nicolás'])).toBe('Martín, a Fernanda y a Nicolás');
    });

    it('arma el texto de los favoritos igual que los datos', () => {
        const m = managed('turno-garzones-matrimonio');
        expect(favoritesText(3, ['Martín', 'Fernanda'])).toBe(roster(m).favoritos?.texto);
        expect(favoritesText(1, ['Martín'])).toBe('Queda 1 cupo. Con un toque confirmas a Martín.');
    });
});

describe('publicationView (GES-01)', () => {
    it('pausar, reanudar y cerrar con motivo cambian el estado y la vigencia', () => {
        const m = managed('turno-garzones-finde');
        expect(publicationView(m, getManageState())).toMatchObject({ estado: 'Activa', vigencia: m.vigencia, canRenew: false });
        setPublicationStatus(m.publicationId, { estado: 'Pausada' });
        expect(publicationView(m, getManageState())).toMatchObject({ estado: 'Pausada', paused: true, closed: false });
        setPublicationStatus(m.publicationId, null);
        expect(publicationView(m, getManageState()).estado).toBe('Activa');
        setPublicationStatus(m.publicationId, { estado: 'Cerrada', motivo: 'El evento se canceló' });
        expect(publicationView(m, getManageState())).toMatchObject({
            estado: 'Cerrada',
            closed: true,
            closedNow: true,
            vigencia: 'Cerrada hoy · El evento se canceló',
        });
    });

    it('un empleo se renueva una vez; un turno nunca', () => {
        const m = managed('aviso-asesor-hogar');
        expect(publicationView(m, getManageState())).toMatchObject({ canRenew: true, expires: '7 ene' });
        renewPublication(m.publicationId);
        expect(publicationView(m, getManageState())).toMatchObject({
            canRenew: false,
            expires: '9 ene',
            vigencia: 'Renovada hoy · hasta el 9 ene',
        });
    });
});

describe('rosterView (GES-04)', () => {
    it('«Garzones fin de semana» parte sin postulados y llegan tras el salto de tiempo', () => {
        const m = managed('turno-garzones-finde');
        const before = rosterView(m, roster(m), getManageState(), apps());
        expect(before).toMatchObject({ waiting: true, total: 8, free: 8, canConfirm: true });
        expect(before.postulados).toHaveLength(0);
        expect(before.favoritesToConfirm).toHaveLength(0);

        arrive(m.publicationId, roster(m).id);
        const after = rosterView(m, roster(m), getManageState(), apps());
        expect(after.waiting).toBe(false);
        expect(after.postulados.map((p) => p.nombre)).toEqual(['Martín Silva', 'Fernanda Castro', 'Nicolás Vargas', 'Antonia Reyes']);
        expect(after.favoritesText).toBe('Quedan 8 cupos. Con un toque confirmas a Martín y a Fernanda.');
        expect(after.favoritesToConfirm.map((p) => p.personId)).toEqual(['martin-silva', 'fernanda-castro']);
    });

    it('confirmar a los favoritos los pasa a Confirmados (2/8) y deja de ofrecerlos', () => {
        const m = managed('turno-garzones-finde');
        arrive(m.publicationId, 'finde-sab-19');
        confirmPeople(m.publicationId, 'finde-sab-19', ['martin-silva', 'fernanda-castro']);
        const v = rosterView(m, roster(m), getManageState(), apps());
        expect(v.confirmados.map((p) => p.nombre)).toEqual(['Martín Silva', 'Fernanda Castro']);
        expect(v.postulados.map((p) => p.nombre)).toEqual(['Nicolás Vargas', 'Antonia Reyes']);
        expect(v.free).toBe(6);
        expect(v.favoritesToConfirm).toHaveLength(0);
        expect(v.favorites.has('martin-silva')).toBe(true);
    });

    it('GES-04 de «Garzones para matrimonio»: 5/8, sin Matías hasta que postula en la sesión', () => {
        const m = managed('turno-garzones-matrimonio');
        const v = rosterView(m, roster(m), getManageState(), apps());
        expect(v.confirmados).toHaveLength(5);
        expect(v.postulados.map((p) => p.nombre)).toEqual(['Martín Silva', 'Fernanda Castro', 'Nicolás Vargas', 'Antonia Reyes']);
        expect(v.favoritesText).toBe(roster(m).favoritos?.texto);
        expect(v.favorites.has('javiera-contreras')).toBe(true);
        expect(v.favorites.has('daniela-gomez')).toBe(false);

        applyTo('matias', m.publicationId, 'Postulado');
        const after = rosterView(m, roster(m), getManageState(), apps());
        expect(after.postulados.map((p) => p.personId)).toContain('matias');
    });

    it('con los cupos llenos o la publicación cerrada ya no se confirma', () => {
        const m = managed('turno-garzones-matrimonio');
        confirmPeople(m.publicationId, 'matrimonio-sab-12', ['martin-silva', 'fernanda-castro', 'nicolas-vargas']);
        const full = rosterView(m, roster(m), getManageState(), apps());
        expect(full).toMatchObject({ full: true, free: 0, canConfirm: false });
        expect(full.favoritesToConfirm).toHaveLength(0);

        resetManage();
        setPublicationStatus(m.publicationId, { estado: 'Cerrada', motivo: 'Otro motivo' });
        expect(rosterView(m, roster(m), getManageState(), apps())).toMatchObject({ closed: true, canConfirm: false });
    });

    it('confirmar nunca pasa de los cupos libres con los favoritos', () => {
        const m = managed('turno-garzones-matrimonio');
        confirmPeople(m.publicationId, 'matrimonio-sab-12', ['nicolas-vargas', 'antonia-reyes']);
        const v = rosterView(m, roster(m), getManageState(), apps());
        expect(v.free).toBe(1);
        expect(v.favoritesToConfirm.map((p) => p.personId)).toEqual(['martin-silva']);
        expect(v.favoritesText).toBe('Queda 1 cupo. Con un toque confirmas a Martín.');
    });

    it('después del turno del sáb 5 dic quedan 6 por evaluar (Matías ya está evaluado)', () => {
        const m = managed('turno-garzones-finde-5dic');
        const v = rosterView(m, roster(m), getManageState(), apps());
        expect(v).toMatchObject({ past: true, canConfirm: false, fecha: 'sáb 5 dic' });
        expect(v.toEvaluate).toHaveLength(6);
        evaluate(m.publicationId, 'finde-sab-5', 'javiera-contreras', 5);
        setAttendance(m.publicationId, 'finde-sab-5', 'felipe-araya', 'no-asistio');
        expect(rosterView(m, roster(m), getManageState(), apps()).toEvaluate).toHaveLength(4);
    });

    it('lista de espera de «Guardia de eventos»: Jorge, con los cupos completos', () => {
        const m = managed('turno-guardia-eventos-19dic');
        const v = rosterView(m, roster(m), getManageState(), apps());
        expect(v.listaEspera.map((p) => p.personId)).toEqual(['jorge']);
        expect(v.full).toBe(true);
    });

    it('«Ver cupos» lleva al primer turno con cupos libres', () => {
        const m = managed('turno-garzones-finde');
        expect(defaultRoster(m, getManageState(), apps())?.id).toBe('finde-sab-19');
        confirmPeople(m.publicationId, 'finde-sab-19', ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
        arrive(m.publicationId, 'finde-sab-19');
        // Solo se confirma a quien postuló: ids sin postulación no llenan los cupos.
        expect(defaultRoster(m, getManageState(), apps())?.id).toBe('finde-sab-19');
    });
});

describe('postulantes (GES-02)', () => {
    it('9 postulantes de Carolina, 6 nuevos, con los filtros de los datos', () => {
        const m = managed('aviso-asesor-hogar');
        const personas = applicantsOf(m, getManageState(), apps());
        expect(personas).toHaveLength(9);
        expect(countNew(personas)).toBe(6);
        const filtros = m.postulantes?.filtros ?? [];
        expect(filtros.map(filterSlug)).toEqual(['todos', 'nuevos', 'en-proceso', 'no-seleccionados']);
        const byFilter = (f: string) => personas.filter((p) => matchesFilter(p.estado, f)).map((p) => p.nombre.split(' ')[0]);
        expect(byFilter('Nuevos')).toHaveLength(6);
        expect(byFilter('En proceso')).toEqual(['Marta']);
        expect(byFilter('No seleccionados')).toEqual(['Sonia']);
        expect(byFilter('Todos')).toHaveLength(9);
    });

    it('avanzar y no seleccionar cambian el estado; deshacer vuelve al de los datos', () => {
        const m = managed('aviso-asesor-hogar');
        setApplicantStatus(m.publicationId, 'carmen-paredes', 'En proceso');
        setApplicantStatus(m.publicationId, 'gladys-mamani', 'No seleccionado');
        const personas = applicantsOf(m, getManageState(), apps());
        expect(personas.find((p) => p.personId === 'carmen-paredes')?.estado).toBe('En proceso');
        expect(personas.find((p) => p.personId === 'gladys-mamani')?.estado).toBe('No seleccionado');
        expect(countNew(personas)).toBe(5);
        setApplicantStatus(m.publicationId, 'carmen-paredes', null);
        expect(applicantsOf(m, getManageState(), apps()).find((p) => p.personId === 'carmen-paredes')?.estado).toBe('Postulado');
    });

    it('quien postula en la sesión aparece al final como «Postulado»', () => {
        const m = managed('empleo-bartender');
        applyTo('pedro', m.publicationId, 'Postulado');
        const personas = applicantsOf(m, getManageState(), apps());
        expect(personas).toHaveLength(6);
        expect(personas[5]).toMatchObject({ personId: 'pedro', estado: 'Postulado' });
    });
});

describe('métricas de GES-01', () => {
    it('salen de los datos y se recalculan con la sesión', () => {
        const m = managed('turno-garzones-finde');
        expect(metricsOf(m, getManageState(), apps())).toEqual(m.metricas);
        arrive(m.publicationId, 'finde-sab-19');
        confirmPeople(m.publicationId, 'finde-sab-19', ['martin-silva', 'fernanda-castro']);
        const [vistas, confirmados] = metricsOf(m, getManageState(), apps());
        expect(confirmados).toEqual({ label: 'Confirmados', valor: '2/12', detalle: '8 el sáb y 4 el dom' });
        // Nadie postula sin verla: 4 personas postularon.
        expect(vistas).toEqual({ label: 'Vistas', valor: '4', detalle: 'recién publicada' });
    });

    it('«9 · 6 nuevos» y «5 · sin revisar», como en los datos', () => {
        expect(metricsOf(managed('aviso-asesor-hogar'), getManageState(), apps())).toEqual(managed('aviso-asesor-hogar').metricas);
        const bartender = managed('empleo-bartender');
        expect(metricsOf(bartender, getManageState(), apps())).toEqual(bartender.metricas);
        setApplicantStatus(bartender.publicationId, 'diego-navarro', 'En proceso');
        expect(metricsOf(bartender, getManageState(), apps())[1]).toEqual({ label: 'Postulantes', valor: '5', detalle: '4 nuevos' });
    });

    it('newDetail', () => {
        expect(newDetail(0, 3)).toBeUndefined();
        expect(newDetail(1, 3)).toBe('1 nuevo');
        expect(newDetail(3, 3)).toBe('sin revisar');
    });
});
