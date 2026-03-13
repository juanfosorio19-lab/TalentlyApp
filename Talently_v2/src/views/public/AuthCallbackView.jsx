// src/views/public/AuthCallbackView.jsx
// Maneja el redirect de Google OAuth después de autenticación exitosa.
// Supabase redirige aquí con el hash/fragment que contiene el access_token.

// REQUISITO: En Supabase Dashboard → Authentication → Providers → Google:
// 1. Habilitar Google provider
// 2. Agregar Client ID y Client Secret de Google Cloud Console
// 3. En Google Cloud Console → OAuth 2.0 → Authorized redirect URIs:
//    https://<tu-proyecto>.supabase.co/auth/v1/callback
// 4. En Supabase Dashboard → Authentication → URL Configuration:
//    Site URL: http://localhost:5173 (desarrollo)
//    Redirect URLs: http://localhost:5173/auth/callback

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '../../lib/supabase';
import { useApp, Actions } from '../../context/AppContext';
import './auth.css';

export default function AuthCallbackView() {
    const navigate = useNavigate();
    const { dispatch } = useApp();
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error || !session) {
                    console.error('[AuthCallbackView] Sin sesión activa:', error?.message);
                    setAuthError(true);
                    setTimeout(() => navigate('/login?error=auth_failed', { replace: true }), 2000);
                    return;
                }

                const user = session.user;

                // Sincronizar usuario con estado global
                dispatch({ type: Actions.SET_USER, payload: user });

                // Intentar leer perfil de la base de datos (usuario existente)
                const { data: profile } = await db.profiles.getById(user.id);

                if (profile) {
                    dispatch({ type: Actions.SET_PROFILE, payload: profile });

                    if (profile.user_type === 'company') {
                        navigate('/company/dashboard', { replace: true });
                    } else {
                        navigate('/app/swipe', { replace: true });
                    }
                    return;
                }

                // Sin perfil → usuario nuevo vía Google.
                // Determinar tipo: user_metadata (si hubo signup con tipo) o
                // talently_pending_user_type (guardado antes del OAuth en RegisterView)
                const metaType = user.user_metadata?.user_type;
                const pendingType = localStorage.getItem('talently_pending_user_type');
                const resolvedType = metaType || pendingType || null;

                // Limpiar el tipo pendiente ya que se procesó
                localStorage.removeItem('talently_pending_user_type');

                if (resolvedType) {
                    dispatch({ type: Actions.SET_PROFILE_TYPE, payload: resolvedType });
                    localStorage.setItem('talently_user_type', resolvedType);

                    // TODO: El onboarding puede pre-llenar nombre y foto de Google usando:
                    // user.user_metadata.full_name y user.user_metadata.avatar_url
                    // (Supabase los popula automáticamente desde el perfil de Google)
                    if (resolvedType === 'company') {
                        navigate('/onboarding/company', { replace: true });
                    } else {
                        navigate('/onboarding/candidate', { replace: true });
                    }
                } else {
                    // Nuevo usuario de Google sin tipo definido → onboarding para elegir tipo
                    navigate('/onboarding/candidate', { replace: true });
                }
            } catch (err) {
                console.error('[AuthCallbackView] Error inesperado:', err);
                setAuthError(true);
                setTimeout(() => navigate('/login?error=auth_failed', { replace: true }), 2000);
            }
        };

        handleCallback();
    }, [dispatch, navigate]);

    return (
        <div className="callback-screen">

            {/* Logo */}
            <div className="callback-logo">
                <div className="callback-logo-mark">T</div>
                <span className="callback-logo-text">Talently</span>
            </div>

            {authError ? (
                /* Estado de error */
                <div className="callback-error">
                    <div className="callback-error-icon">
                        <span className="material-symbols-rounded">error</span>
                    </div>
                    <p className="callback-error-text">No se pudo autenticar.</p>
                    <p className="callback-error-redirect">Redirigiendo...</p>
                </div>
            ) : (
                /* Estado de carga */
                <div className="callback-loading">
                    <div className="callback-spinner" aria-hidden="true" />
                    <p className="callback-loading-text">Iniciando sesión...</p>
                </div>
            )}

        </div>
    );
}
