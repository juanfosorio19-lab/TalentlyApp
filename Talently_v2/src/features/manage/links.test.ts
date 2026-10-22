import { describe, expect, it } from 'vitest';
import { isSheetEntry, overManageOf, overManageState, shareUrl } from './links';

describe('historial entre GES-01 y GES-04', () => {
    it('lee las entradas hasta GES-01 solo si son un entero positivo', () => {
        expect(overManageOf(overManageState(1))).toBe(1);
        expect(overManageOf(overManageState(2))).toBe(2);
        expect(overManageOf(null)).toBeNull();
        expect(overManageOf(undefined)).toBeNull();
        expect(overManageOf({ sheet: 'opciones' })).toBeNull();
        expect(overManageOf({ overManage: 0 })).toBeNull();
        expect(overManageOf({ overManage: '1' })).toBeNull();
        expect(overManageOf({ overManage: 1.5 })).toBeNull();
    });

    it('reconoce la entrada de una hoja abierta por la app', () => {
        expect(isSheetEntry({ sheet: 'opciones' }, 'opciones')).toBe(true);
        expect(isSheetEntry({ sheet: 'evaluar' }, 'opciones')).toBe(false);
        expect(isSheetEntry(overManageState(1), 'opciones')).toBe(false);
        expect(isSheetEntry(null, 'opciones')).toBe(false);
    });
});

describe('shareUrl (GES-01 comparte igual que DET-01)', () => {
    it('con HashRouter: la página más la ruta, sin la query de la demo', () => {
        const location = { origin: 'http://127.0.0.1:5173', pathname: '/v3.html' };
        expect(shareUrl(location, '#/p/turno-garzones-finde')).toBe('http://127.0.0.1:5173/v3.html#/p/turno-garzones-finde');
    });

    it('con BrowserRouter: la ruta sola', () => {
        expect(shareUrl({ origin: 'https://talently.cl', pathname: '/publicaciones/x' }, '/p/x')).toBe('https://talently.cl/p/x');
    });
});
