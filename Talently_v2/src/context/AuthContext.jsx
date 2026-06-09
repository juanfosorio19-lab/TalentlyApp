// src/context/AuthContext.jsx
// Estado global de autenticación — reemplaza las verificaciones con window.supabaseClient
import { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase, db } from '../lib/supabase';
import { logError } from '../lib/errorLogger';

const AuthContext = createContext(null);

// Si el fetch del perfil se cuelga (WebView Android), no dejamos el routing
// pinneado para siempre: tras este tiempo seguimos sin perfil (el tipo se
// deriva de user_metadata). Es una RED DE SEGURIDAD; en condiciones normales
// el fetch resuelve en <1s.
const PROFILE_TIMEOUT_MS = 8000;
function withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${label}_timeout_${ms}ms`)), ms)
        ),
    ]);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);                       // auth user object
    const [profile, setProfile] = useState(null);                 // profiles row (has user_type)
    const [loading, setLoading] = useState(true);                 // chequeo inicial de sesión
    const [profileFetchedFor, setProfileFetchedFor] = useState(null); // user.id cuyo perfil YA resolvió

    useEffect(() => {
        let isMounted = true;

        // ⚠️ CRÍTICO: el fetch del perfil se hace DIFERIDO (setTimeout 0), FUERA
        // del callback de onAuthStateChange. supabase-js AWAITa la notificación
        // de subscribers DENTRO de signInWithPassword/signUp. Si el callback hace
        // `await getById(...)`, esas llamadas no resuelven hasta que el fetch
        // termine; en el WebView de Android ese primer fetch autenticado se
        // cuelga → login pegado en "Ingresando…" sin error. Diferirlo lo saca
        // del lock de auth y deja que signIn resuelva de inmediato.
        const loadProfile = (uid, email) => {
            setTimeout(async () => {
                logError('AUTH_PROFILE', 'fetch:start', { uid }, { level: 'info', overlay: false, userEmail: email });
                try {
                    const { data, error } = await withTimeout(
                        db.profiles.getById(uid), PROFILE_TIMEOUT_MS, 'profile_fetch'
                    );
                    if (!isMounted) return;
                    if (error) {
                        logError('AUTH_PROFILE', 'fetch:error', { msg: error.message, code: error.code },
                            { level: 'warn', overlay: false, userEmail: email });
                    } else {
                        logError('AUTH_PROFILE', `fetch:ok profile=${data ? 'yes' : 'none'}`, null,
                            { level: 'info', overlay: false, userEmail: email });
                    }
                    setProfile(data ?? null);
                } catch (e) {
                    if (!isMounted) return;
                    // Timeout o fallo de red: NO bloquear el routing. Seguimos sin
                    // perfil; RoleRedirect/OnboardingGate usan user_metadata.
                    logError('AUTH_PROFILE', 'fetch:timeout_or_throw', { msg: e?.message, name: e?.name },
                        { level: 'error', overlay: false, userEmail: email });
                    setProfile(null);
                } finally {
                    if (isMounted) setProfileFetchedFor(uid);
                }
            }, 0);
        };

        // Patrón idiomático de Supabase JS: NO llamar getSession()/getUser()
        // explícitamente — onAuthStateChange dispara INITIAL_SESSION al subscribir
        // (después de hidratar storage). El callback es SÍNCRONO a propósito.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!isMounted) return;
                const newUser = session?.user ?? null;
                setUser(newUser);
                // Loading (chequeo inicial) se cierra en el primer evento.
                setLoading(false);

                if (newUser) {
                    loadProfile(newUser.id, newUser.email);
                } else {
                    setProfile(null);
                    setProfileFetchedFor(null);
                }
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // ── Deep link OAuth (solo nativo / APK) ──
    // Cuando Google redirige a com.talently.app://auth/callback?code=...,
    // Android dispara appUrlOpen. Intercambiamos el code por sesión (PKCE).
    // onAuthStateChange (arriba) detecta SIGNED_IN → setUser → LoginView/
    // RegisterView navegan a /dashboard via su useEffect de isAuthenticated.
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        let listenerHandle;
        (async () => {
            const { App } = await import('@capacitor/app');
            listenerHandle = await App.addListener('appUrlOpen', async ({ url }) => {
                if (!url || !url.includes('auth/callback')) return;
                try {
                    const parsed = new URL(url);
                    const code = parsed.searchParams.get('code');
                    if (code) {
                        await supabase.auth.exchangeCodeForSession(code);
                    }
                } catch (err) {
                    console.error('[AuthContext] Error en deep link OAuth:', err);
                } finally {
                    // Cerrar el in-app browser tras volver
                    try {
                        const { Browser } = await import('@capacitor/browser');
                        await Browser.close();
                    } catch { /* noop */ }
                }
            });
        })();

        return () => {
            listenerHandle?.remove?.();
        };
    }, []);

    // Derived state
    const isAuthenticated = !!user;
    const userType = profile?.user_type || null; // 'candidate' | 'company' | null
    // authReady: la sesión inicial ya se chequeó Y (no hay user, o el perfil de
    // ESTE user ya resolvió). Los guards (PrivateRoute/OnboardingGate/RoleRedirect)
    // esperan a authReady para no enrutar antes de tener el perfil cargado.
    const authReady = !loading && (!user || profileFetchedFor === user.id);

    const value = {
        user,
        profile,
        loading,
        authReady,
        isAuthenticated,
        userType,
        // Convenience methods
        signOut: async () => {
            await db.auth.signOut();
            setUser(null);
            setProfile(null);
            setProfileFetchedFor(null);
        },
        refreshProfile: async () => {
            if (user) {
                const { data } = await db.profiles.getById(user.id);
                setProfile(data);
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook for consuming auth state
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
