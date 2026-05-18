// src/hooks/useAuthListener.js
// Escucha supabase.auth.onAuthStateChange() y sincroniza con AppContext.
// Usar en main.jsx o App.jsx para mantener el estado global actualizado.

import { useEffect } from 'react';
import { supabase, db } from '../lib/supabase';
import { useApp, Actions } from '../context/AppContext';

export default function useAuthListener() {
    const { dispatch } = useApp();

    useEffect(() => {
        // 1. Verificar sesión existente al montar
        const initSession = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    dispatch({ type: Actions.SET_USER, payload: user });

                    const { data: profile } = await db.profiles.getById(user.id);
                    if (profile) {
                        dispatch({ type: Actions.SET_PROFILE, payload: profile });
                    } else {
                        // Sin perfil → usar user_type de metadata o localStorage
                        const metaType = user.user_metadata?.user_type;
                        const storedType = localStorage.getItem('talently_user_type');
                        const userType = metaType || storedType || null;

                        if (userType) {
                            dispatch({ type: Actions.SET_PROFILE_TYPE, payload: userType });
                        }
                    }
                }
            } catch (err) {
                console.error('[useAuthListener] Error al inicializar sesión:', err);
            }
        };

        initSession();

        // 2. Escuchar cambios de auth (login, logout, token refresh, password recovery,
        //    y SIGNED_IN desde Google OAuth cuando el browser vuelve de /auth/callback)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const user = session?.user ?? null;

                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    // Funciona igual para email/password y Google OAuth.
                    // Para Google: session.user.app_metadata.provider === 'google'
                    dispatch({ type: Actions.SET_USER, payload: user });

                    if (user) {
                        const { data: profile } = await db.profiles.getById(user.id);
                        if (profile) {
                            dispatch({ type: Actions.SET_PROFILE, payload: profile });
                        } else {
                            // Sin perfil: leer tipo desde user_metadata (email signup con data),
                            // talently_pending_user_type (guardado antes de OAuth en RegisterView),
                            // o talently_user_type (fallback legacy)
                            const metaType = user.user_metadata?.user_type;
                            const pendingType = localStorage.getItem('talently_pending_user_type');
                            const storedType = localStorage.getItem('talently_user_type');
                            const resolvedType = metaType || pendingType || storedType || null;

                            if (resolvedType) {
                                dispatch({
                                    type: Actions.SET_PROFILE_TYPE,
                                    payload: resolvedType,
                                });
                            }
                        }
                    }
                }

                if (event === 'SIGNED_OUT') {
                    dispatch({ type: Actions.LOGOUT });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [dispatch]);
}
