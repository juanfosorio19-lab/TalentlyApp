// src/lib/errorLogger.js
// Logger remoto + local. Funciona en web Y en el APK (producción).
// Canal A: inserta en Supabase public.client_logs (lo leemos via MCP/service_role).
// Canal B: localStorage (window.__showErrorLog()) + overlay visible en pantalla.
//
// La anon key es pública (ya está en el bundle). El insert va por fetch directo
// al REST endpoint para NO depender del cliente supabase-js (que podría ser justo
// lo que está fallando).

const SUPABASE_URL = 'https://femlqgaqqmkeqtjeruqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbWxxZ2FxcW1rZXF0amVydXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTc2MTEsImV4cCI6MjA4MjU5MzYxMX0.7KuB9qQqv-cUaXKi2b6zV8I99dbmp8CNwlEN5uElJRQ';

function getPlatform() {
    try {
        if (window.Capacitor?.getPlatform) return window.Capacitor.getPlatform();
        if (window.Capacitor?.isNativePlatform?.()) return 'native';
    } catch { /* noop */ }
    return 'web';
}

// ── Canal A: enviar a Supabase client_logs ──
async function sendRemote(entry) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/client_logs`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                level: entry.level || 'error',
                context: entry.context || 'GENERAL',
                message: String(entry.message || '').slice(0, 2000),
                detail: entry.detail || null,
                platform: getPlatform(),
                user_agent: navigator.userAgent,
                app_url: window.location.href,
                user_email: entry.userEmail || null,
            }),
        });
    } catch (e) {
        // Si el remoto falla (ej. sin red / fetch bloqueado) guardamos la causa local.
        appendLocal({ context: 'LOGGER_REMOTE_FAIL', message: String(e?.message || e) });
    }
}

// ── Canal B: localStorage ──
function appendLocal(entry) {
    try {
        const log = JSON.parse(localStorage.getItem('talently_error_log') || '[]');
        log.push({ ...entry, ts: new Date().toISOString(), platform: getPlatform() });
        // Mantener solo los últimos 50
        localStorage.setItem('talently_error_log', JSON.stringify(log.slice(-50)));
    } catch { /* noop */ }
}

// ── Canal B': overlay visible en pantalla (para screenshot inmediato) ──
function showOverlay(entry) {
    try {
        let box = document.getElementById('talently-error-overlay');
        if (!box) {
            box = document.createElement('div');
            box.id = 'talently-error-overlay';
            box.style.cssText = [
                'position:fixed', 'left:8px', 'right:8px', 'bottom:8px', 'z-index:2147483647',
                'background:#2a0d12', 'color:#ffd7df', 'border:1px solid #ff6b9d',
                'border-radius:10px', 'padding:12px 14px', 'font:12px/1.45 monospace',
                'max-height:45vh', 'overflow:auto', 'box-shadow:0 8px 32px rgba(0,0,0,.5)',
                'white-space:pre-wrap', 'word-break:break-word',
            ].join(';');
            // Botón cerrar
            const close = document.createElement('button');
            close.textContent = '✕ cerrar';
            close.style.cssText = 'float:right;background:#ff6b9d;color:#1a1a1a;border:none;border-radius:6px;padding:4px 8px;font-weight:700;cursor:pointer';
            close.onclick = () => box.remove();
            box.appendChild(close);
            const title = document.createElement('div');
            title.textContent = '⚠ Talently — error capturado';
            title.style.cssText = 'font-weight:700;margin-bottom:6px;color:#ff8fab';
            box.appendChild(title);
            const content = document.createElement('div');
            content.id = 'talently-error-overlay-content';
            box.appendChild(content);
            document.body.appendChild(box);
        }
        const content = document.getElementById('talently-error-overlay-content');
        const line = document.createElement('div');
        line.style.cssText = 'margin-top:6px;padding-top:6px;border-top:1px dashed #ff6b9d55';
        line.textContent = `[${entry.context}] ${entry.message}` +
            (entry.detail?.stack ? `\n${String(entry.detail.stack).slice(0, 600)}` : '');
        content.appendChild(line);
    } catch { /* noop */ }
}

// ── API pública: log explícito desde cualquier parte ──
export function logError(context, message, detail = null, opts = {}) {
    const entry = {
        level: opts.level || 'error',
        context,
        message: typeof message === 'string' ? message : (message?.message || String(message)),
        detail: detail || (message?.stack ? { stack: message.stack, name: message.name } : null),
        userEmail: opts.userEmail || null,
    };
    appendLocal(entry);
    sendRemote(entry);
    if (opts.overlay !== false) showOverlay(entry);
    console.warn('[ErrorLogger]', context, entry.message);
}

export function initErrorLogger() {
    // Errores JS síncronos no capturados
    window.onerror = (message, source, line, col, error) => {
        logError('RUNTIME_ERROR', message, {
            stack: error?.stack || 'sin stack',
            location: `${source}:${line}:${col}`,
        });
    };

    // Promesas rechazadas sin catch (típico: fetch a Supabase falla)
    window.onunhandledrejection = (event) => {
        const reason = event.reason;
        logError('UNHANDLED_PROMISE', reason?.message || String(reason), {
            stack: reason?.stack || 'sin stack',
            name: reason?.name,
        });
    };

    // Ver el log local desde consola (chrome://inspect)
    window.__showErrorLog = () => {
        const log = JSON.parse(localStorage.getItem('talently_error_log') || '[]');
        console.table(log);
        return log;
    };

    // Log de arranque: confirma que la app inició, en qué plataforma y QUÉ
    // versión del bundle web corre (commit inyectado por Vite en build).
    // Esto SIEMPRE debería aparecer en client_logs si la app carga y hay red.
    const buildCommit = typeof __BUILD_COMMIT__ !== 'undefined' ? __BUILD_COMMIT__ : 'dev';
    logError('APP_BOOT', `App iniciada en plataforma "${getPlatform()}" version=${buildCommit}`, null, {
        level: 'info', overlay: false,
    });
}
