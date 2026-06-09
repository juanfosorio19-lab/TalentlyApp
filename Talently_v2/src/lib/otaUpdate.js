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
        } catch {
            // sin red / error de descarga: reintenta en el próximo appStateChange
        }
    };

    // 3. Aplicar al salir de la app (silencioso → se ve en el próximo arranque).
    App.addListener('appStateChange', async (state) => {
        if (state.isActive) {
            checkAndDownload();
        } else if (pending?.version) {
            try {
                await CapacitorUpdater.set(pending); // se activa en el próximo arranque
                pending = null;
            } catch { /* si falla, se reintenta */ }
        }
    });

    // Chequeo inicial al arrancar.
    checkAndDownload();
}
