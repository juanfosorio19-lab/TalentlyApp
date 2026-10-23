// Las rutas que el router conoce desde el inicio (routeManifest, carga
// diferida) son exactamente las que declara el routes.tsx de cada feature.
// Si un feature agrega o cambia una ruta, esta prueba dice dónde anotarla.
import { describe, expect, it } from 'vitest';
import { matchRoutes } from 'react-router-dom';
import { paths } from './paths';
import { FEATURES } from './routeManifest';
import { routes } from './router';
import { canOpen, registerRoutes } from './navigation/routeRegistry';

describe('routeManifest', () => {
    for (const [name, feature] of Object.entries(FEATURES)) {
        it(`${name}: mismas rutas que su routes.tsx, solo con path y element`, async () => {
            const { tabRoutes, stackRoutes } = await feature.load();
            expect(tabRoutes.map((r) => r.path)).toEqual(feature.tab);
            expect(stackRoutes.map((r) => r.path)).toEqual(feature.stack);
            // La carga diferida copia solo el `element`: un loader, hijos o index también irían aquí.
            for (const r of [...tabRoutes, ...stackRoutes]) expect(Object.keys(r).sort()).toEqual(['element', 'path']);
        });
    }

    it('canOpen sigue conociendo todas las pantallas antes de bajarlas (y no las que faltan)', () => {
        registerRoutes(routes);
        for (const path of [
            paths.inicio(),
            paths.explorar('turno'),
            paths.notificaciones(),
            paths.publicacion('turno-garzones-matrimonio'),
            paths.gestionarPublicacion('turno-garzones-finde'),
            paths.cuposTurno('turno-garzones-finde', 'finde-sab-19', 'postulados'),
            paths.publicar('turno', 2),
            paths.publicado('turno'),
            paths.organizacion('banqueteria'),
            paths.configuracion(),
        ]) {
            expect(canOpen(path), path).toBe(true);
        }
        expect(canOpen(paths.eliminarCuenta())).toBe(false);
        expect(canOpen(paths.favoritos('banqueteria'))).toBe(false);
    });

    it('las raíces de pestaña van dentro del AppShell (con TabBar)', () => {
        const shellOf = (path: string) => matchRoutes(routes, path)?.length;
        // RootLayout → AppShell → pestaña; RootLayout → pantalla apilada.
        expect(shellOf('/inicio')).toBe(3);
        expect(shellOf('/mensajes')).toBe(3);
        expect(shellOf('/mensajes/conv-1')).toBe(2);
    });
});
