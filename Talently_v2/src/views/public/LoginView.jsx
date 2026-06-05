// src/views/public/LoginView.jsx
// Login con email + password — usa supabase.auth.signInWithPassword()
// También soporta Google OAuth via supabase.auth.signInWithOAuth()
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { signInWithGoogle } from '../../lib/oauth';
import { logError } from '../../lib/errorLogger';
import { useApp, Actions } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

const GoogleIcon = () => (
    <svg className="auth-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

export default function LoginView() {
    const navigate = useNavigate();
    const { dispatch } = useApp();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Si el user ya está autenticado, redirigir a /dashboard (RoleRedirect lo
    // manda al destino correcto según rol + estado de onboarding).
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    const handleGoogleLogin = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            // signInWithGoogle detecta plataforma: web (redirect) vs nativo (in-app browser)
            const { error: oauthError } = await signInWithGoogle();
            if (oauthError) {
                setError(oauthError.message);
                setGoogleLoading(false);
            }
            // Web: el browser redirige a Google. Nativo: el deep link de retorno
            // lo captura AuthContext y onAuthStateChange dispara el redirect.
        } catch (err) {
            console.error('[LoginView] Error Google OAuth:', err);
            setError('No se pudo iniciar sesión con Google. Intenta nuevamente.');
            setGoogleLoading(false);
        }
    };

    const handleLogin = async () => {
        setError('');

        if (!email || !password) {
            setError('Completa todos los campos');
            return;
        }

        setLoading(true);

        try {
            const { data, error: signInError } = await db.auth.signIn(email, password);

            if (signInError) {
                // Log detallado para diagnosticar (status, code, name) — ver client_logs
                logError('AUTH_LOGIN', signInError.message, {
                    name: signInError.name,
                    status: signInError.status,
                    code: signInError.code,
                    stack: signInError.stack,
                }, { userEmail: email });
                setError(
                    signInError.message === 'Invalid login credentials'
                        ? 'Credenciales incorrectas. Verifica tu email y contraseña.'
                        : signInError.message
                );
                return;
            }

            const user = data.user;

            // Guardar usuario en estado global
            dispatch({ type: Actions.SET_USER, payload: user });

            // Obtener perfil para determinar tipo (candidate / company)
            const { data: profileData } = await db.profiles.getById(user.id);

            // Determinar tipo: profile (si existe) o user_metadata (signup pendiente de onboarding)
            const userType = profileData?.user_type || user?.user_metadata?.user_type || 'candidate';

            if (profileData) {
                dispatch({ type: Actions.SET_PROFILE, payload: profileData });
            }

            // Si NO hay profile o el onboarding no se completó → wizard
            if (!profileData || !profileData.onboarding_completed) {
                navigate(
                    userType === 'company' ? '/onboarding/company' : '/onboarding/candidate',
                    { replace: true }
                );
                return;
            }

            // Onboarding completo → dashboard del rol
            if (userType === 'company') {
                navigate('/company/dashboard', { replace: true });
            } else {
                navigate('/app', { replace: true });
            }
        } catch (err) {
            // Esto captura "Failed to fetch", errores de red/TLS del WebView, etc.
            logError('AUTH_LOGIN_THROW', err?.message || String(err), {
                name: err?.name,
                stack: err?.stack,
            }, { userEmail: email });
            setError('Ocurrió un error. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <main className="login-main">

                {/* ── Hero: logo + título + tagline ── */}
                <div className="login-hero">
                    <div className="login-logo-icon">
                        <span className="material-symbols-rounded">work</span>
                    </div>
                    <h1 className="login-brand">Talently</h1>
                    <p className="login-tagline">Conectando talento con oportunidades</p>
                </div>

                {/* ── Card ── */}
                <div className="login-card">

                    {/* Email */}
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="login-email">
                            Correo electrónico
                        </label>
                        <div className="auth-input-wrapper">
                            <span className="material-symbols-rounded auth-input-icon">mail</span>
                            <input
                                id="login-email"
                                name="email"
                                className="auth-input"
                                type="email"
                                placeholder="nombre@ejemplo.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="login-password">
                            Contraseña
                        </label>
                        <div className="auth-input-wrapper">
                            <span className="material-symbols-rounded auth-input-icon">lock</span>
                            <input
                                id="login-password"
                                name="password"
                                className="auth-input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="auth-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                <span className="material-symbols-rounded">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                        {/* Recovery link — debajo del campo de contraseña */}
                        <div className="auth-recovery">
                            <button
                                type="button"
                                className="auth-link-btn"
                                onClick={() => navigate('/recovery')}
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="auth-error">
                            <span className="material-symbols-rounded">error</span>
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        className="auth-btn auth-btn--primary"
                        type="button"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? 'Ingresando…' : 'Iniciar sesión'}
                    </button>

                    {/* Divider */}
                    <div className="auth-divider">
                        <span className="auth-divider-text">O continúa con</span>
                    </div>

                    {/* Google OAuth */}
                    <button
                        className="auth-btn auth-btn--google"
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading}
                    >
                        <GoogleIcon />
                        {googleLoading ? 'Redirigiendo…' : 'Google'}
                    </button>

                </div>

                {/* ── Footer: ir a registro ── */}
                <p className="auth-footer-text">
                    ¿No tienes cuenta?{' '}
                    <button
                        type="button"
                        className="auth-link-btn"
                        onClick={() => navigate('/register')}
                    >
                        Regístrate
                    </button>
                </p>

            </main>
        </div>
    );
}
