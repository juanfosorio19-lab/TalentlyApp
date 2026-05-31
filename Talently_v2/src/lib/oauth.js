// src/lib/oauth.js
// Helper de OAuth con Google que detecta plataforma (web vs Capacitor nativo).
//
// WEB: flujo estándar de redirect del browser → /auth/callback (AuthCallbackView).
// NATIVO (APK): abre el OAuth en un in-app browser (@capacitor/browser) y captura
//   el retorno vía deep link (com.talently.app://auth/callback) que escucha
//   AuthContext con App.addListener('appUrlOpen'). Usa flujo PKCE.
//
// ⚠️ CONFIG EXTERNA REQUERIDA para que el OAuth nativo funcione (ver docs/MOBILE.md):
//   1. Google Cloud Console: registrar el SHA-1 del keystore + OAuth client Android
//   2. Supabase Dashboard → Auth → URL Configuration → Redirect URLs:
//      agregar  com.talently.app://auth/callback
import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

// Deep link scheme nativo. DEBE coincidir con el intent-filter del AndroidManifest
// y con la Redirect URL configurada en Supabase Dashboard.
export const NATIVE_REDIRECT = 'com.talently.app://auth/callback';

/**
 * Inicia sesión con Google. Retorna { error } (o { error: null } si OK).
 * @param {'candidate'|'company'|null} pendingType tipo elegido antes del OAuth (signup)
 */
export async function signInWithGoogle(pendingType = null) {
    if (pendingType) {
        localStorage.setItem('talently_pending_user_type', pendingType);
    }

    // ── Nativo (APK): in-app browser + deep link ──
    if (Capacitor.isNativePlatform()) {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: NATIVE_REDIRECT,
                skipBrowserRedirect: true, // no redirigir el WebView; abriremos el browser
            },
        });
        if (error) return { error };

        if (data?.url) {
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({ url: data.url, presentationStyle: 'popover' });
        }
        return { error: null };
    }

    // ── Web: redirect normal del browser ──
    return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/auth/callback' },
    });
}
