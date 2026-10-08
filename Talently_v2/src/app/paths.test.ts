import { describe, expect, it } from 'vitest';
import { isTabRoot, paths, tabOf } from './paths';

describe('paths', () => {
    it('arma rutas en español con parámetros opcionales', () => {
        expect(paths.inicio()).toBe('/inicio');
        expect(paths.explorar()).toBe('/explorar');
        expect(paths.explorar('turno')).toBe('/explorar?tipo=turno');
        expect(paths.actividad('agenda')).toBe('/actividad?seg=agenda');
        expect(paths.publicacion('abc')).toBe('/p/abc');
        expect(paths.cuposTurno('p1', 's9')).toBe('/publicaciones/p1/turnos/s9');
        expect(paths.buscar('garzón')).toBe('/buscar?q=garz%C3%B3n');
    });

    it('reconoce la pestaña de una ruta', () => {
        expect(tabOf('/inicio')).toBe('inicio');
        expect(tabOf('/mensajes/123')).toBe('mensajes');
        expect(tabOf('/p/123')).toBeNull();
        expect(tabOf('/')).toBeNull();
    });

    it('distingue raíces de pestaña de pantallas apiladas', () => {
        expect(isTabRoot('/explorar')).toBe(true);
        expect(isTabRoot('/mensajes/123')).toBe(false);
        expect(isTabRoot('/notificaciones')).toBe(false);
    });
});
