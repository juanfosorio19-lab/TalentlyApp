// Entrada del rediseño Talently 3.0 (v3.html). Aislada de la app actual
// (index.html → src/main.jsx), que es la que hoy viaja por OTA al APK.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '../ui/styles/tokens.css';
import '../ui/styles/bundle.css';
import '../ui/styles/app.css';
import { DemoSessionProvider } from '../features/demo/session';
import { UiCatalog } from './dev/UiCatalog';
import { ThemeProvider } from './providers/ThemeProvider';
import { createAppRouter } from './router';

// v3.html?only=Button,Chip abre solo el catálogo (capturas de revisión de componentes).
const catalogOnly = new URLSearchParams(window.location.search).has('only');

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            {catalogOnly ? (
                <UiCatalog />
            ) : (
                <DemoSessionProvider>
                    <RouterProvider router={createAppRouter()} />
                </DemoSessionProvider>
            )}
        </ThemeProvider>
    </StrictMode>,
);
