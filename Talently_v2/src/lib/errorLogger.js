// src/lib/errorLogger.js
// Solo activo en desarrollo (import.meta.env.DEV)
export function initErrorLogger() {
    if (!import.meta.env.DEV) return;

    // Errores JS síncronos
    window.onerror = (message, source, line, col, error) => {
        appendToLog({
            tipo: 'RUNTIME_ERROR', mensaje: message,
            ubicacion: `${source}:${line}:${col}`,
            stack: error?.stack || 'sin stack',
            timestamp: new Date().toISOString()
        });
    };

    // Promesas rechazadas sin catch (ej: llamadas a Supabase)
    window.onunhandledrejection = (event) => {
        appendToLog({
            tipo: 'UNHANDLED_PROMISE',
            mensaje: event.reason?.message || String(event.reason),
            stack: event.reason?.stack || 'sin stack',
            timestamp: new Date().toISOString()
        });
    };

    // Ver log desde consola del navegador
    window.__showErrorLog = () => {
        const log = JSON.parse(localStorage.getItem('talently_error_log') || '[]');
        console.table(log);
        return log;
    };
}

function appendToLog(entry) {
    const existing = JSON.parse(localStorage.getItem('talently_error_log') || '[]');
    existing.push(entry);
    localStorage.setItem('talently_error_log', JSON.stringify(existing, null, 2));
    console.warn('[ErrorLogger]', entry);
}