// src/views/public/RegisterView.jsx
// Registro: selección tipo (candidato/empresa) + email + password
// También soporta Google OAuth — sin tipo seleccionado redirige a /onboarding
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useApp, Actions } from '../../context/AppContext';
import './auth.css';

const GoogleIcon = () => (
    <svg className="auth-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

export default function RegisterView() {
    const navigate = useNavigate();
    const { dispatch } = useApp();

    // Step 1: elegir tipo, Step 2: formulario
    const [step, setStep] = useState(1);
    const [profileType, setProfileType] = useState(null); // 'candidate' | 'company'

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // pendingType: el tipo elegido antes de hacer OAuth (guardado en localStorage
    // para que AuthCallbackView lo lea si user_metadata.user_type está vacío)
    const handleGoogleOAuth = async (pendingType = null) => {
        setError('');
        if (pendingType) {
            localStorage.setItem('talently_pending_user_type', pendingType);
        }
        setGoogleLoading(true);
        try {
            const { error: oauthError } = await db.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin + '/auth/callback' },
            });
            if (oauthError) {
                setError(oauthError.message);
                setGoogleLoading(false);
            }
            // Si no hay error, el browser redirige a Google — no se ejecuta más código aquí
        } catch (err) {
            console.error('[RegisterView] Error Google OAuth:', err);
            setError('No se pudo continuar con Google. Intenta nuevamente.');
            setGoogleLoading(false);
        }
    };

    const handleRegister = async () => {
        setError('');

        if (!name || !email || !password) {
            setError('Completa todos los campos');
            return;
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            const { data, error: signUpError } = await db.auth.signUp(
                email,
                password,
                { data: { user_type: profileType, full_name: name } }
            );

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    setError('Este email ya está registrado. Intenta iniciar sesión.');
                } else {
                    setError(signUpError.message);
                }
                return;
            }

            const user = data.user;

            // Persistir tipo en localStorage (leído por AppContext)
            localStorage.setItem('talently_user_type', profileType);

            // Actualizar estado global
            dispatch({ type: Actions.SET_USER, payload: user });
            dispatch({ type: Actions.SET_PROFILE_TYPE, payload: profileType });

            // Redirigir según tipo
            if (profileType === 'company') {
                navigate('/company/dashboard', { replace: true });
            } else {
                navigate('/app/swipe', { replace: true });
            }
        } catch (err) {
            console.error('[RegisterView] Error inesperado:', err);
            setError('Ocurrió un error. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        if (!profileType) return;
        setError('');
        setStep(2);
    };

    // ─── Paso 1: Selección de tipo ───
    if (step === 1) {
        return (
            <div className="register-screen">
                <div className="register-bg-top" />
                <div className="register-bg-blob" />

                <div className="register-step2-wrapper">
                    {/* Card principal */}
                    <div className="register-step2-card">

                        {/* Header */}
                        <div className="register-step2-header">
                            <button
                                className="register-nav-btn"
                                onClick={() => navigate('/')}
                                aria-label="Volver"
                            >
                                <span className="material-symbols-rounded">arrow_back</span>
                            </button>
                            <h1 className="register-step2-title">¡Hola! 👋<br />¿Quién eres?</h1>
                            <p className="register-step2-subtitle">
                                Selecciona tu rol para personalizar tu experiencia en{' '}
                                <span className="register-brand-accent">Talently</span>.
                            </p>
                        </div>

                        {/* Contenido */}
                        <div className="register-step2-form">

                            {/* Progress dots */}
                            <div className="register-step1-progress">
                                <div className="register-progress-dot register-progress-dot--active" />
                                <div className="register-progress-dot" />
                                <div className="register-progress-dot" />
                            </div>

                            {/* Tarjetas de tipo */}
                            <div className="register-cards">
                                {/* Candidato */}
                                <button
                                    className={`register-type-card${profileType === 'candidate' ? ' register-type-card--selected' : ''}`}
                                    type="button"
                                    onClick={() => { setProfileType('candidate'); setError(''); }}
                                >
                                    <div className="register-card-icon register-card-icon--candidate">
                                        <span className="material-symbols-rounded">person_search</span>
                                    </div>
                                    <div className="register-card-body">
                                        <h3 className="register-card-title">Soy Candidato</h3>
                                        <p className="register-card-desc">
                                            Busco nuevas oportunidades laborales y quiero conectar con empresas top.
                                        </p>
                                        <ul className="register-card-features">
                                            <li className="register-card-feature">
                                                <span className="material-symbols-rounded register-check-icon">check_circle</span>
                                                Encuentra ofertas relevantes
                                            </li>
                                            <li className="register-card-feature">
                                                <span className="material-symbols-rounded register-check-icon">check_circle</span>
                                                Swipe para hacer match
                                            </li>
                                        </ul>
                                    </div>
                                    <span className="material-symbols-rounded register-radio-icon">
                                        {profileType === 'candidate' ? 'radio_button_checked' : 'radio_button_unchecked'}
                                    </span>
                                </button>

                                {/* Empresa */}
                                <button
                                    className={`register-type-card${profileType === 'company' ? ' register-type-card--selected' : ''}`}
                                    type="button"
                                    onClick={() => { setProfileType('company'); setError(''); }}
                                >
                                    <div className="register-card-icon register-card-icon--company">
                                        <span className="material-symbols-rounded">business</span>
                                    </div>
                                    <div className="register-card-body">
                                        <h3 className="register-card-title">Soy Empresa</h3>
                                        <p className="register-card-desc">
                                            Busco el mejor talento tecnológico para unirse a mi equipo.
                                        </p>
                                        <ul className="register-card-features">
                                            <li className="register-card-feature">
                                                <span className="material-symbols-rounded register-check-icon">check_circle</span>
                                                Publica ofertas de empleo
                                            </li>
                                            <li className="register-card-feature">
                                                <span className="material-symbols-rounded register-check-icon">check_circle</span>
                                                Explora perfiles verificados
                                            </li>
                                        </ul>
                                    </div>
                                    <span className="material-symbols-rounded register-radio-icon">
                                        {profileType === 'company' ? 'radio_button_checked' : 'radio_button_unchecked'}
                                    </span>
                                </button>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="auth-error">
                                    <span className="material-symbols-rounded">error</span>
                                    {error}
                                </div>
                            )}

                            {/* Continuar */}
                            <button
                                className="auth-btn auth-btn--primary register-continue-btn"
                                type="button"
                                onClick={handleContinue}
                                disabled={!profileType}
                            >
                                Continuar
                                <span className="material-symbols-rounded">arrow_forward</span>
                            </button>

                            {/* Divider */}
                            <div className="auth-divider">
                                <span className="auth-divider-text">o</span>
                            </div>

                            {/* Google */}
                            <button
                                className="auth-btn auth-btn--google"
                                type="button"
                                onClick={() => handleGoogleOAuth(profileType)}
                                disabled={googleLoading}
                            >
                                <GoogleIcon />
                                {googleLoading ? 'Redirigiendo…' : 'Continuar con Google'}
                            </button>

                            {/* Legal */}
                            <p className="register-legal">
                                Al continuar, aceptas nuestros{' '}
                                <button
                                    type="button"
                                    className="register-legal-link"
                                    onClick={() => navigate('/terms')}
                                >
                                    Términos
                                </button>
                                {' '}y{' '}
                                <button
                                    type="button"
                                    className="register-legal-link"
                                    onClick={() => navigate('/privacy')}
                                >
                                    Privacidad
                                </button>.
                            </p>
                        </div>
                    </div>

                    {/* Footer fuera de la card */}
                    <p className="auth-footer-text">
                        ¿Ya tienes cuenta?{' '}
                        <button
                            type="button"
                            className="auth-link-btn"
                            onClick={() => navigate('/login')}
                        >
                            Inicia sesión
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    // ─── Paso 2: Formulario de registro ───
    return (
        <div className="register-screen">
            <div className="register-bg-top" />
            <div className="register-bg-blob" />

            <div className="register-step2-wrapper">
                {/* Card principal */}
                <div className="register-step2-card">

                    {/* Header: back + título + subtítulo */}
                    <div className="register-step2-header">
                        <button
                            className="register-nav-btn"
                            onClick={() => setStep(1)}
                            aria-label="Volver"
                        >
                            <span className="material-symbols-rounded">arrow_back</span>
                        </button>
                        <h1 className="register-step2-title">Crear cuenta</h1>
                        <p className="register-step2-subtitle">Encuentra tu próximo reto profesional</p>
                    </div>

                    {/* Campos del formulario */}
                    <div className="register-step2-form">

                        {/* Nombre */}
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="reg-name">Nombre completo</label>
                            <div className="auth-input-wrapper">
                                <span className="material-symbols-rounded auth-input-icon">person</span>
                                <input
                                    id="reg-name"
                                    name="name"
                                    className="auth-input"
                                    type="text"
                                    placeholder="Ej. María García"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="reg-email">Correo electrónico</label>
                            <div className="auth-input-wrapper">
                                <span className="material-symbols-rounded auth-input-icon">mail</span>
                                <input
                                    id="reg-email"
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

                        {/* Contraseña */}
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="reg-password">Contraseña</label>
                            <div className="auth-input-wrapper">
                                <span className="material-symbols-rounded auth-input-icon">lock</span>
                                <input
                                    id="reg-password"
                                    name="password"
                                    className="auth-input"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mínimo 8 caracteres"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="auth-toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                                >
                                    <span className="material-symbols-rounded">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
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
                            onClick={handleRegister}
                            disabled={loading}
                        >
                            {loading ? 'Creando cuenta…' : 'Continuar'}
                        </button>

                        {/* Divider */}
                        <div className="auth-divider">
                            <span className="auth-divider-text">o</span>
                        </div>

                        {/* Google */}
                        <button
                            className="auth-btn auth-btn--google"
                            type="button"
                            onClick={() => handleGoogleOAuth(profileType)}
                            disabled={googleLoading || loading}
                        >
                            <GoogleIcon />
                            {googleLoading ? 'Redirigiendo…' : 'Continuar con Google'}
                        </button>

                    </div>
                </div>

                {/* Footer fuera de la card */}
                <p className="auth-footer-text">
                    ¿Ya tienes cuenta?{' '}
                    <button
                        type="button"
                        className="auth-link-btn"
                        onClick={() => navigate('/login')}
                    >
                        Inicia sesión
                    </button>
                </p>
            </div>
        </div>
    );
}
