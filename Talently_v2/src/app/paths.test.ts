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
        expect(paths.verificarIdentidad()).toBe('/verificacion/identidad');
        expect(paths.verificarIdentidad('/publicar/hogar/listo')).toBe('/verificacion/identidad?volver=%2Fpublicar%2Fhogar%2Flisto');
        expect(paths.publicado('hogar')).toBe('/publicar/hogar/listo');
        expect(paths.favoritos('banqueteria')).toBe('/o/banqueteria/favoritos');
        expect(paths.perfil()).toBe('/perfil');
        expect(paths.perfil('cv')).toBe('/perfil?sheet=cv');
        expect(paths.publicacion('abc', 'postular')).toBe('/p/abc?sheet=postular');
        expect(paths.cuposTurno('p1', 's9', 'postulados')).toBe('/publicaciones/p1/turnos/s9?ver=postulados');
        expect(paths.explorar('personas', { p: 'aviso-1' })).toBe('/explorar?tipo=personas&p=aviso-1');
        expect(paths.explorar('empleo', { vista: 'lista' })).toBe('/explorar?tipo=empleo&empleo.vista=lista');
        expect(paths.verificarCorreo()).toBe('/registro/verificar');
        expect(paths.eliminarCuenta()).toBe('/eliminar-cuenta');
        expect(paths.equipo('banqueteria')).toBe('/o/banqueteria/equipo');
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
