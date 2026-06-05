// src/main.jsx — Entry point de Talently v2
import { initErrorLogger } from './lib/errorLogger';
initErrorLogger(); // captura errores antes de todo

import { initCapacitor } from './lib/capacitorInit';
initCapacitor(); // config nativa (StatusBar) — no-op en web

// Fonts via npm (no CDN — ver ERROR_LOG.md #1)
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource-variable/material-symbols-rounded';

// Styles
import './styles/variables.css';
import './styles/base.css';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  </StrictMode>,
);
