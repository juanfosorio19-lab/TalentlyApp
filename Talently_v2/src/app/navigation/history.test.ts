import { afterEach, describe, expect, it, vi } from 'vitest';
import { flowOriginOf, flowOriginState, historyIndex, returnToEntry } from './history';
import { noteEntry, resetEntriesForTests } from './tabMemory';
import { backToTabRootBelow, tabAwareOptions } from './useOpenPath';

const setIdx = (idx: number | undefined) => window.history.replaceState(idx === undefined ? null : { idx }, '');

afterEach(() => {
    setIdx(undefined);
    resetEntriesForTests();
});

describe('historial de la app', () => {
    it('lee el índice de React Router', () => {
        setIdx(3);
        expect(historyIndex()).toBe(3);
        setIdx(undefined);
        expect(historyIndex()).toBe(0);
    });

    it('flowOriginState: la entrada de debajo de la hoja que abre el flujo', () => {
        setIdx(1);
        expect(flowOriginState()).toEqual({ flowOrigin: 0 });
        expect(flowOriginOf({ flowOrigin: 0 })).toBe(0);
        expect(flowOriginOf({ flowOrigin: -1 })).toBe(-1);
        expect(flowOriginOf({ sheet: 'publicar' })).toBeNull();
        expect(flowOriginOf(null)).toBeNull();
    });

    it('returnToEntry: un solo salto hacia atrás y después el destino', () => {
        setIdx(3);
        const go = vi.fn();
        const then = vi.fn();
        returnToEntry(1, go, then);
        expect(go).toHaveBeenCalledWith(-2);
        expect(then).not.toHaveBeenCalled();
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(then).toHaveBeenCalledOnce();
        // Ya está ahí: sin salto.
        const go2 = vi.fn();
        const then2 = vi.fn();
        returnToEntry(5, go2, then2);
        expect(go2).not.toHaveBeenCalled();
        expect(then2).toHaveBeenCalledOnce();
    });
});

describe('tabAwareOptions (spec §5.3 reglas 1 y 2)', () => {
    it('la raíz de una pestaña reemplaza; una pantalla apilada apila', () => {
        setIdx(2);
        expect(tabAwareOptions('/explorar?tipo=turno', '/p/x')).toEqual({ replace: true });
        expect(tabAwareOptions('/p/x', '/explorar')).toBeUndefined();
    });

    it('desde Inicio en la primera entrada apila (Inicio queda debajo para el atrás de la web)', () => {
        setIdx(0);
        expect(tabAwareOptions('/mensajes', '/inicio')).toEqual({ replace: false });
        expect(tabAwareOptions('/inicio?sheet=actor', '/inicio')).toEqual({ replace: true });
    });

    it('un replace explícito manda', () => {
        setIdx(0);
        expect(tabAwareOptions('/mensajes', '/inicio', { replace: true })).toEqual({ replace: true });
    });
});

describe('backToTabRootBelow (sin dos entradas de la misma pestaña seguidas)', () => {
    it('desde una pantalla apilada, si la raíz de destino es la entrada de abajo, vuelve a ella', () => {
        noteEntry(0, '/inicio');
        noteEntry(1, '/actividad');
        setIdx(2);
        expect(backToTabRootBelow('/actividad?seg=postulaciones', '/p/turno-x')).toBe(true);
        // Otra pestaña debajo: replace normal.
        expect(backToTabRootBelow('/explorar?tipo=turno', '/p/turno-x')).toBe(false);
        // Desde una raíz de pestaña (cambiar de segmento) o con un replace explícito, no.
        expect(backToTabRootBelow('/actividad?seg=agenda', '/actividad')).toBe(false);
        expect(backToTabRootBelow('/actividad', '/p/turno-x', { replace: true })).toBe(false);
        // Una pantalla apilada nunca.
        expect(backToTabRootBelow('/p/otra', '/p/turno-x')).toBe(false);
    });
});
