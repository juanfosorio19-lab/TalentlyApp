// Entrada del rediseño Talently 3.0 (v3.html). Aislada de la app actual
// (index.html → src/main.jsx), que es la que hoy viaja por OTA al APK.
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '../ui/styles/tokens.css';
import '../ui/styles/bundle.css';
import '../ui/styles/app.css';
import { DemoSessionProvider } from '../features/demo/session';
import { ThemeProvider } from './providers/ThemeProvider';
import { prefetchFeatures } from './routeManifest';
import { createAppRouter } from './router';

// v3.html?only=Button,Chip abre solo el catálogo (capturas de revisión de componentes). Solo en desarrollo:
// en el build de producción el catálogo no existe (ni su código ni sus demos).
const UiCatalog = import.meta.env.DEV ? lazy(() => import('./dev/UiCatalog').then((m) => ({ default: m.UiCatalog }))) : null;
const catalogOnly = UiCatalog !== null && new URLSearchParams(window.location.search).has('only');

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            {catalogOnly && UiCatalog ? (
                <Suspense fallback={null}>
                    <UiCatalog />
                </Suspense>
            ) : (
                <DemoSessionProvider>
                    <RouterProvider router={createAppRouter()} />
                </DemoSessionProvider>
            )}
        </ThemeProvider>
    </StrictMode>,
);

// Después de pintar la primera pantalla, el resto de las features baja en segundo plano.
if (!catalogOnly) {
    const idle = (cb: () => void) =>
        typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(cb, { timeout: 3000 }) : window.setTimeout(cb, 1500);
    if (document.readyState === 'complete') idle(prefetchFeatures);
    else window.addEventListener('load', () => idle(prefetchFeatures), { once: true });
}
