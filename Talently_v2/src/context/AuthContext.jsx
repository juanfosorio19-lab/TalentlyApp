// src/context/AuthContext.jsx
// Estado global de autenticación — reemplaza las verificaciones con window.supabaseClient
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, db } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);          // auth user object
    const [profile, setProfile] = useState(null);     // profiles row (has user_type)
    const [loading, setLoading] = useState(true);     // initial session check

    useEffect(() => {
        let isMounted = true;

        // Patrón idiomático de Supabase JS: NO llamar getSession()/getUser()
        // explícitamente — onAuthStateChange dispara INITIAL_SESSION al subscribir
        // (después de hidratar storage). Evita el LockManager y el AbortError
        // que causa StrictMode con dobles mounts.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;
                const newUser = session?.user ?? null;
                setUser(newUser);

                if (newUser) {
                    const { data: profileData } = await db.profiles.getById(newUser.id);
                    if (!isMounted) return;
                    setProfile(profileData);
                } else {
                    setProfile(null);
                }
                // Loading se setea false en el primer evento (INITIAL_SESSION
                // o el primer SIGNED_IN/SIGNED_OUT que llegue).
                if (isMounted) setLoading(false);
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Derived state
    const isAuthenticated = !!user;
    const userType = profile?.user_type || null; // 'candidate' | 'company' | null

    const value = {
        user,
        profile,
        loading,
        isAuthenticated,
        userType,
        // Convenience methods
        signOut: async () => {
            await db.auth.signOut();
            setUser(null);
            setProfile(null);
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
