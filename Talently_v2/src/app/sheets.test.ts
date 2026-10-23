import { describe, expect, it } from 'vitest';
import { isSheetEntry, withoutSheet } from './sheets';

describe('withoutSheet (scroll, memoria de pestañas y cerrar una hoja que llegó por enlace)', () => {
    it('quita la hoja y los parámetros que agregó show()', () => {
        const state = { sheet: 'publicar', sheetParams: ['tipo'] };
        expect(withoutSheet('?sheet=publicar&tipo=turno', state)).toBe('');
        expect(withoutSheet('?tipo=turno&sheet=filtros&turno.fecha=Hoy', null)).toBe('?tipo=turno&turno.fecha=Hoy');
    });

    it('sin estado (enlace), quita los parámetros que declara la hoja', () => {
        expect(withoutSheet('?sheet=editar&s=sobre-mi', null, ['s'])).toBe('');
        expect(withoutSheet('?tipo=personas&p=aviso&sheet=verificacion&persona=x', null, ['publicacion', 'persona'])).toBe(
            '?tipo=personas&p=aviso',
        );
    });

    it('no toca una búsqueda sin hoja', () => {
        expect(withoutSheet('?tipo=turno', null)).toBe('?tipo=turno');
        expect(withoutSheet('', null)).toBe('');
    });

    it('isSheetEntry: solo la hoja que abrió la app', () => {
        expect(isSheetEntry({ sheet: 'opciones' }, 'opciones')).toBe(true);
        expect(isSheetEntry({ sheet: 'evaluar' }, 'opciones')).toBe(false);
        expect(isSheetEntry(null, 'opciones')).toBe(false);
    });
});
