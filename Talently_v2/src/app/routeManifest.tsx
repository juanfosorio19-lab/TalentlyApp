// Las rutas de cada feature con su pantalla en carga diferida (react-router
// `lazy`): el código de un feature se baja la primera vez que se abre una de
// sus pantallas, no al abrir la app. Así el chunk de v3 no carga las 13
// features juntas (vite build: ninguno pasa de 500 kB).
//
// Por qué las rutas se repiten aquí: el router tiene que conocer cada `path`
// desde el inicio, antes de bajar nada. canOpen() (useOpenPath, «Disponible
// pronto» en vez de SYS-404) pregunta al router si existe una pantalla y la
// memoria de pestañas arma sus enlaces con esas rutas; react-router no deja
// declarar `path` ni `children` en `lazy`. El routes.tsx de cada feature
// sigue siendo el que dice QUÉ pantalla va en cada ruta; routeManifest.test.ts
// verifica que las rutas de aquí sean exactamente las suyas.
import type { RouteObject } from 'react-router-dom';
import { LoadErrorScreen } from './system/LoadErrorScreen';

export interface FeatureRoutes {
    tabRoutes: RouteObject[];
    stackRoutes: RouteObject[];
}

export interface FeatureManifest {
    /** El routes.tsx del feature (su chunk). */
    load: () => Promise<FeatureRoutes>;
    /** Los `path` de sus `tabRoutes` (raíces de pestaña, dentro del AppShell). */
    tab: readonly string[];
    /** Los `path` de sus `stackRoutes` (pantallas apiladas). */
    stack: readonly string[];
}

/** Las features, en el orden en que router.tsx las compone. */
export const FEATURES = {
    home: { load: () => import('../features/home/routes'), tab: ['inicio'], stack: ['notificaciones'] },
    explore: { load: () => import('../features/explore/routes'), tab: ['explorar'], stack: ['buscar'] },
    activity: { load: () => import('../features/activity/routes'), tab: ['actividad'], stack: ['turnos/:assignmentId'] },
    messaging: { load: () => import('../features/messaging/routes'), tab: ['mensajes'], stack: ['mensajes/:conversationId'] },
    profile: { load: () => import('../features/profile/routes'), tab: ['perfil'], stack: ['configuracion', 'perfil/impulsar'] },
    publications: { load: () => import('../features/publications/routes'), tab: [], stack: ['p/:id'] },
    manage: {
        load: () => import('../features/manage/routes'),
        tab: [],
        stack: ['publicaciones/:id', 'publicaciones/:id/postulantes', 'publicaciones/:id/turnos/:shiftId'],
    },
    processes: { load: () => import('../features/processes/routes'), tab: [], stack: ['procesos/:engagementId', 'resena/:engagementId'] },
    verification: { load: () => import('../features/verification/routes'), tab: [], stack: ['verificacion', 'verificacion/identidad'] },
    publish: { load: () => import('../features/publish/routes'), tab: [], stack: ['publicar/:tipo/:paso', 'publicar/:tipo/listo'] },
    onboarding: {
        load: () => import('../features/onboarding/routes'),
        tab: [],
        stack: [
            'bienvenida',
            'registro',
            'registro/verificar',
            'onboarding/intencion',
            'onboarding/datos',
            'onboarding/trabajo/:paso',
            'onboarding/listo',
        ],
    },
    legal: { load: () => import('../features/legal/routes'), tab: [], stack: ['terminos', 'privacidad'] },
    publicProfile: { load: () => import('../features/public-profile/routes'), tab: [], stack: ['u/:id', 'o/:id'] },
} satisfies Record<string, FeatureManifest>;

const MANIFESTS: readonly FeatureManifest[] = Object.values(FEATURES);

/**
 * Una ruta del feature: el `path` desde el inicio y la pantalla (su `element`)
 * cuando se abre. Mientras baja, la pantalla de antes sigue a la vista (el
 * router espera para cambiar de entrada); si no llega, LoadErrorScreen.
 */
function lazyRoute(feature: FeatureManifest, kind: 'tab' | 'stack', path: string): RouteObject {
    return {
        path,
        errorElement: <LoadErrorScreen />,
        lazy: async () => {
            const routes = await feature.load();
            const route = (kind === 'tab' ? routes.tabRoutes : routes.stackRoutes).find((r) => r.path === path);
            if (!route?.element) throw new Error(`La ruta «${path}» no está en el routes.tsx de su feature`);
            return { element: route.element };
        },
    };
}

/** Raíces de pestaña de todas las features (van dentro del AppShell). */
export const lazyTabRoutes = (): RouteObject[] => MANIFESTS.flatMap((f) => f.tab.map((path) => lazyRoute(f, 'tab', path)));

/** Pantallas apiladas de todas las features. */
export const lazyStackRoutes = (): RouteObject[] => MANIFESTS.flatMap((f) => f.stack.map((path) => lazyRoute(f, 'stack', path)));

/**
 * Baja en segundo plano el código de las features que todavía no se abrieron
 * (después de pintar la primera pantalla): el primer toque a otra pestaña no
 * espera la red. Si falla, no pasa nada: se vuelve a pedir al abrirla.
 */
export function prefetchFeatures(): void {
    for (const f of MANIFESTS) void f.load().catch(() => undefined);
}
