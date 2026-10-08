// Entrada del rediseño Talently 3.0 (v3.html). Aislada de la app actual
// (index.html → src/main.jsx), que es la que hoy viaja por OTA al APK.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../ui/styles/tokens.css';
import '../ui/styles/bundle.css';
import '../ui/styles/app.css';
import { ThemeProvider } from './providers/ThemeProvider';
import { UiCatalog } from './dev/UiCatalog';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            <UiCatalog />
        </ThemeProvider>
    </StrictMode>,
);
