// src/lib/capacitorInit.js
// Configuración nativa de Capacitor que corre al arrancar la app (solo en APK).
import { Capacitor } from '@capacitor/core';

// ── Status bar según tema ──
// ⚠️ Semántica del enum (fácil de invertir): Style.Light = TEXTO OSCURO para
// fondos claros; Style.Dark = TEXTO CLARO para fondos oscuros. Antes se usaba
// Style.Dark con la app clara → hora/íconos blancos sobre blanco (invisibles).
// AppContext llama esto cada vez que cambia el dark mode.
export async function setStatusBarTheme(isDark) {
    if (!Capacitor.isNativePlatform()) return;
    try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
        try {
            // En Android <15 (sin edge-to-edge) también pintamos el fondo.
            await StatusBar.setBackgroundColor({ color: isDark ? '#0F172A' : '#FFFFFF' });
        } catch { /* no soportado en algunas versiones */ }
    } catch (e) {
        console.warn('[capacitorInit] StatusBar style falló:', e);
    }
}

export async function initCapacitor() {
    if (!Capacitor.isNativePlatform()) return;

    // ── StatusBar: que el WebView NO quede detrás de la barra de estado ──
    // En Android 15+ esto es no-op (edge-to-edge forzado); ahí el espacio lo
    // reservan los safe-area insets en CSS (ver global.css).
    try {
        const { StatusBar } = await import('@capacitor/status-bar');
        await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (e) {
        console.warn('[capacitorInit] StatusBar config falló:', e);
    }

    // Estilo inicial según la preferencia guardada (AppContext re-aplica al
    // hidratar y en cada toggle).
    const isDark = localStorage.getItem('talently_dark_mode') === 'true';
    setStatusBarTheme(isDark);
}
