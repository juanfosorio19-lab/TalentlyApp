// src/lib/capacitorInit.js
// Configuración nativa de Capacitor que corre al arrancar la app (solo en APK).
import { Capacitor } from '@capacitor/core';

export async function initCapacitor() {
    if (!Capacitor.isNativePlatform()) return;

    // ── StatusBar: que el WebView NO quede detrás de la barra de estado ──
    // Sin esto, el header (logo Talently) choca con la hora/iconos del teléfono.
    try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setOverlaysWebView({ overlay: false }); // reserva el espacio de la status bar
        await StatusBar.setStyle({ style: Style.Dark });        // iconos oscuros (fondo claro)
        await StatusBar.setBackgroundColor({ color: '#FFFFFF' }); // fondo blanco como el header
    } catch (e) {
        console.warn('[capacitorInit] StatusBar config falló:', e);
    }
}
