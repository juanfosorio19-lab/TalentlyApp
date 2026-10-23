import { afterEach, describe, expect, it } from 'vitest';
import { getHomeFeed, getManagedPublication, getOrgDashboard, getPublication } from './data';
import { applyTo, resetSession, getSessionState } from './sessionStore';
import type { DemoManagedPublication } from './types';
import {
    applicantsOf,
    countNew,
    defaultRoster,
    expiryOf,
    avisoBlockView,
    favoritesText,
    isBeforeToday,
    isPublicationActive,
    managedSessionOf,
    membersOf,
    missingText,
    orgDashboardView,
    publicationWithSession,
    startsInText,
    joinWithA,
    metricsOf,
    newDetail,
    parseDemoDate,
    publicationView,
    rosterView,
    todayPlus,
} from './manageSelectors';
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
} from './manageState';

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

    it('pausada o cerrada no recibe postulaciones (el salto de tiempo no se programa); pausada sí confirma', () => {
        const m = managed('turno-garzones-finde');
        expect(rosterView(m, roster(m), getManageState(), apps())).toMatchObject({ accepting: true, paused: false });

        setPublicationStatus(m.publicationId, { estado: 'Pausada' });
        expect(rosterView(m, roster(m), getManageState(), apps())).toMatchObject({
            paused: true,
            accepting: false,
            canConfirm: true,
            waiting: true,
        });

        setPublicationStatus(m.publicationId, { estado: 'Cerrada', motivo: 'Otro motivo' });
        expect(rosterView(m, roster(m), getManageState(), apps())).toMatchObject({ closed: true, accepting: false, canConfirm: false });

        // El turno que ya pasó tampoco recibe postulaciones.
        const past = managed('turno-garzones-finde-5dic');
        expect(rosterView(past, roster(past), getManageState(), apps())).toMatchObject({ past: true, accepting: false });
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
    it('9 postulantes de Carolina, 6 nuevos', () => {
        const m = managed('aviso-asesor-hogar');
        const personas = applicantsOf(m, getManageState(), apps());
        expect(personas).toHaveLength(9);
        expect(countNew(personas)).toBe(6);
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

describe('INI-02 al día con la sesión (orgDashboardView)', () => {
    const panel = () => {
        const p = getOrgDashboard('banqueteria');
        if (!p) throw new Error('Sin panel');
        return p;
    };
    const kpi = (id: string) => orgDashboardView(panel(), getManageState(), apps()).kpis.find((k) => k.id === id)?.valor;
    const atencion = () => orgDashboardView(panel(), getManageState(), apps()).atencion.map((a) => a.texto);

    it('al empezar dice lo mismo que el prototipo, salvo «Turnos de la semana» (sale de los cupos de la demo)', () => {
        expect(kpi('postulantes')).toBe('12');
        expect(kpi('turnos')).toBe('1/3 cubiertos');
        expect(kpi('conversaciones')).toBe('3');
        expect(atencion()).toEqual(panel().atencion.map((a) => a.texto));
        expect(orgDashboardView(panel(), getManageState(), apps()).atencion[0]?.detalle).toBe('Empieza en 23 h');
    });

    it('confirmar en GES-04 baja «faltan» y los postulantes nuevos, y cubre el turno', () => {
        confirmPeople('turno-garzones-almuerzo', 'almuerzo-vie-11', ['daniela-gomez']);
        expect(atencion()[0]).toBe('Turno vie 11 dic · 12:00: falta 1 garzón');
        expect(kpi('postulantes')).toBe('11');
        confirmPeople('turno-garzones-almuerzo', 'almuerzo-vie-11', ['sebastian-perez']);
        expect(atencion()).not.toContain('Turno vie 11 dic · 12:00: falta 1 garzón');
        expect(kpi('turnos')).toBe('2/3 cubiertos');
    });

    it('revisar en GES-02 y evaluar en GES-04 descuentan sus pendientes', () => {
        setApplicantStatus('empleo-bartender', 'diego-navarro', 'En proceso');
        expect(atencion()).toContain('4 postulantes sin revisar en Bartender');
        evaluate('turno-garzones-finde-5dic', 'finde-sab-5', 'javiera-contreras', 5);
        expect(atencion()).toContain('Evalúa a 5 personas del turno del sáb 5 dic');
        for (const id of ['felipe-araya', 'daniela-gomez', 'sebastian-perez', 'constanza-leiva', 'nicolas-vargas']) {
            evaluate('turno-garzones-finde-5dic', 'finde-sab-5', id, 4);
        }
        expect(atencion().some((t) => t.startsWith('Evalúa'))).toBe(false);
    });

    it('los postulados del «salto de tiempo» suman al llegar y no cuentan si se pausa', () => {
        arrive('turno-garzones-finde', 'finde-sab-19');
        expect(kpi('postulantes')).toBe('16');
        setPublicationStatus('turno-garzones-finde', { estado: 'Cerrada', motivo: 'Otro motivo' });
        expect(kpi('postulantes')).toBe('12');
    });

    it('textos de faltan y de cuándo empieza', () => {
        const r = roster(managed('turno-garzones-almuerzo'));
        expect(missingText(2, r)).toBe('faltan 2 garzones');
        expect(missingText(1, r)).toBe('falta 1 garzón');
        expect(startsInText(30)).toBe('Empieza en 30 min');
        expect(startsInText(23 * 60)).toBe('Empieza en 23 h');
        expect(startsInText(72 * 60)).toBe('Empieza en 3 días');
    });
});

describe('«Tu aviso» de Carolina (avisoBlockView)', () => {
    const block = () => {
        const b = getHomeFeed('carolina').bloques.find((x) => x.tipo === 'tu-aviso');
        if (!b) throw new Error('Sin «Tu aviso»');
        return b;
    };

    it('dice «6 postulantes nuevos» como el prototipo y baja al revisar en GES-02', () => {
        expect(avisoBlockView(block(), getManageState(), apps())).toMatchObject({ detalle: '6 postulantes nuevos', estado: 'Activa' });
        setApplicantStatus('aviso-asesor-hogar', 'carmen-paredes', 'En proceso');
        expect(avisoBlockView(block(), getManageState(), apps())).toMatchObject({ detalle: '5 postulantes nuevos' });
        setPublicationStatus('aviso-asesor-hogar', { estado: 'Pausada' });
        expect(avisoBlockView(block(), getManageState(), apps())).toMatchObject({ estado: 'Pausada' });
    });
});

describe('Actividad y Explorar leen lo mismo que GES-01 y GES-04', () => {
    it('managedSessionOf: estado, métricas y confirmados por bloque', () => {
        const of = managedSessionOf(getManageState(), apps());
        expect(of('turno-garzones-matrimonio')?.confirmados.get('matrimonio-sab-12')).toBe(5);
        confirmPeople('turno-garzones-matrimonio', 'matrimonio-sab-12', ['martin-silva']);
        setPublicationStatus('turno-garzones-matrimonio', { estado: 'Pausada' });
        const after = managedSessionOf(getManageState(), apps())('turno-garzones-matrimonio');
        expect(after?.estado).toBe('Pausada');
        expect(after?.confirmados.get('matrimonio-sab-12')).toBe(6);
        expect(after?.metricas.find((m) => m.label === 'Confirmados')?.valor).toBe('6/8');
        expect(of('no-existe')).toBeUndefined();
    });

    it('membersOf: los postulados del «salto de tiempo» aparecen al llegar; Matías, al postular', () => {
        expect(membersOf('turno-garzones-finde', getManageState(), apps()).has('martin-silva')).toBe(false);
        arrive('turno-garzones-finde', 'finde-sab-19');
        confirmPeople('turno-garzones-finde', 'finde-sab-19', ['martin-silva']);
        const members = membersOf('turno-garzones-finde', getManageState(), apps());
        expect(members.get('martin-silva')).toEqual({ kind: 'confirmado', rosterId: 'finde-sab-19' });
        expect(members.get('fernanda-castro')).toEqual({ kind: 'postulado', rosterId: 'finde-sab-19' });

        expect(membersOf('turno-garzones-matrimonio', getManageState(), apps()).has('matias')).toBe(false);
        applyTo('matias', 'turno-garzones-matrimonio', 'Postulado');
        expect(membersOf('turno-garzones-matrimonio', getManageState(), apps()).get('matias')?.kind).toBe('postulado');
    });

    it('isPublicationActive sigue la pausa y el cierre de GES-01', () => {
        expect(isPublicationActive('turno-garzones-finde', getManageState())).toBe(true);
        setPublicationStatus('turno-garzones-finde', { estado: 'Pausada' });
        expect(isPublicationActive('turno-garzones-finde', getManageState())).toBe(false);
        expect(isPublicationActive('turno-garzones-finde-5dic', getManageState())).toBe(false);
    });
});

describe('la publicación vista por quien postula (publicationWithSession)', () => {
    it('«Quedan 3 de 8 cupos» baja al confirmar en GES-04; pausada deja de estar activa', () => {
        const pub = getPublication('turno-garzones-matrimonio');
        if (pub?.tipo !== 'turno') throw new Error('Sin turno');
        expect(publicationWithSession(pub, getManageState(), apps())).toBe(pub);
        confirmPeople('turno-garzones-matrimonio', 'matrimonio-sab-12', ['martin-silva']);
        const live = publicationWithSession(pub, getManageState(), apps());
        expect(live.cupos).toEqual({ ...pub.cupos, left: pub.cupos.left - 1 });
        expect(live.bloques[0]?.cupos?.left).toBe((pub.bloques[0]?.cupos?.left ?? 0) - 1);
        setPublicationStatus('turno-garzones-matrimonio', { estado: 'Pausada' });
        expect(publicationWithSession(pub, getManageState(), apps()).estado).toBe('Pausada');
        const otra = getPublication('turno-bodega-noche');
        if (otra) expect(publicationWithSession(otra, getManageState(), apps())).toBe(otra);
    });
});
