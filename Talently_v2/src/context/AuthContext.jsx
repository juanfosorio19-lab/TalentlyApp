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
        // 1. Check existing session on mount
        const initSession = async () => {
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                setUser(currentUser);

                if (currentUser) {
                    const { data: profileData } = await db.profiles.getById(currentUser.id);
                    setProfile(profileData);
                }
            } catch (err) {
                console.error('[AuthContext] Session init error:', err);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        // 2. Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const newUser = session?.user ?? null;
                setUser(newUser);

                if (newUser) {
                    const { data: profileData } = await db.profiles.getById(newUser.id);
                    setProfile(profileData);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
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
