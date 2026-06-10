// src/lib/otaUpdate.js
// Auto-actualización OTA (Over-The-Air) de la capa web del APK.
// - Cerebro/manifest: tabla Supabase `app_bundles` (qué versión es la última).
// - Archivos: el .zip del bundle vive en GitHub Releases (URL pública).
// - Comportamiento: SILENCIOSO. Al abrir descarga en background; aplica cuando
//   el usuario deja la app, para que el nuevo bundle esté en el próximo arranque.
//
// notifyAppReady() es la red de seguridad: si un bundle nuevo crashea antes de
// confirmarse, Capgo hace ROLLBACK automático al bundle anterior. Por eso lo
// llamamos apenas la app monta.
//
// ⚠️ Solo capa WEB (JS/CSS/HTML). Cambios nativos (plugins, permisos,
// capacitor.config) siguen requiriendo regenerar el APK.
import { Capacitor } from '@capacitor/core';
import { logError } from './errorLogger';

// Breadcrumb remoto del ciclo OTA (silencioso, sin overlay) — permite ver en
// client_logs si el dispositivo chequea/descarga/aplica bundles.
const otaLog = (message) => logError('OTA', message, null, { level: 'info', overlay: false });

const SUPABASE_URL = 'https://femlqgaqqmkeqtjeruqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbWxxZ2FxcW1rZXF0amVydXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTc2MTEsImV4cCI6MjA4MjU5MzYxMX0.7KuB9qQqv-cUaXKi2b6zV8I99dbmp8CNwlEN5uElJRQ';

export async function initOtaUpdate() {
    // En web no hay nada que actualizar OTA (el deploy web es normal).
    if (!Capacitor.isNativePlatform()) return;

    let CapacitorUpdater, App;
    try {
        ({ CapacitorUpdater } = await import('@capgo/capacitor-updater'));
        ({ App } = await import('@capacitor/app'));
    } catch {
        return; // plugin no disponible (APK viejo sin el plugin)
    }

    // 1. Confirmar que el bundle ACTUAL cargó bien (evita rollback del que ya corre).
    try { await CapacitorUpdater.notifyAppReady(); } catch { /* noop */ }

    // Breadcrumb: qué bundle corre ahora ('builtin' = el que vino en el APK).
    try {
        const current = await CapacitorUpdater.current();
        otaLog(`boot bundle=${current?.bundle?.version || current?.bundle?.id || 'builtin'}`);
    } catch { /* noop */ }

    let pending = null;

    // 2. Chequear el manifest y descargar (silencioso) si hay versión nueva.
    const checkAndDownload = async () => {
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/app_bundles?select=version,url&order=created_at.desc&limit=1`,
                { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
            );
            if (!res.ok) return;
            const rows = await res.json();
            const latest = rows?.[0];
            if (!latest?.version || !latest?.url) return;

            const current = await CapacitorUpdater.current();
            const currentVersion = current?.bundle?.version;
            if (latest.version === currentVersion) return;            // ya al día
            if (pending?.version === latest.version) return;          // ya descargado, esperando aplicar

            pending = await CapacitorUpdater.download({ url: latest.url, version: latest.version });
            otaLog(`download:ok version=${latest.version}`);
        } catch (e) {
            // sin red / error de descarga: reintenta en el próximo appStateChange
            otaLog(`download:error ${String(e?.message || e).slice(0, 200)}`);
        }
    };

    // 3. Aplicar al salir de la app (silencioso → se ve en el próximo arranque).
    App.addListener('appStateChange', async (state) => {
        if (state.isActive) {
            checkAndDownload();
        } else if (pending?.version) {
            try {
                const applied = pending.version;
                await CapacitorUpdater.set(pending); // se activa en el próximo arranque
                pending = null;
                otaLog(`set:ok version=${applied} (activo en el próximo arranque)`);
            } catch { /* si falla, se reintenta */ }
        }
    });

    // Chequeo inicial al arrancar.
    checkAndDownload();
}
