import { afterEach, describe, expect, it } from 'vitest';
import { getManagedPublication } from '../demo/data';
import { applicantsOf } from '../demo/manageSelectors';
import { getManageState, resetManage } from '../demo/manageState';
import { getSessionState } from '../demo/sessionStore';
import { CLOSE_REASONS, REJECT_MESSAGES, filterSlug, matchesFilter } from './selectors';

afterEach(() => resetManage());

describe('filtros de GES-02', () => {
    it('los filtros de los datos, con su slug y sus personas', () => {
        const m = getManagedPublication('aviso-asesor-hogar');
        if (!m) throw new Error('Sin aviso-asesor-hogar');
        const personas = applicantsOf(m, getManageState(), getSessionState().applications);
        const filtros = m.postulantes?.filtros ?? [];
        expect(filtros.map(filterSlug)).toEqual(['todos', 'nuevos', 'en-proceso', 'no-seleccionados']);
        const byFilter = (f: string) => personas.filter((p) => matchesFilter(p.estado, f)).map((p) => p.nombre.split(' ')[0]);
        expect(byFilter('Nuevos')).toHaveLength(6);
        expect(byFilter('En proceso')).toEqual(['Marta']);
        expect(byFilter('No seleccionados')).toEqual(['Sonia']);
        expect(byFilter('Todos')).toHaveLength(9);
    });

    it('motivos de cierre y mensajes de «No seleccionar»', () => {
        expect(CLOSE_REASONS.turno).toContain('Otro motivo');
        expect(REJECT_MESSAGES).toHaveLength(3);
    });
});
