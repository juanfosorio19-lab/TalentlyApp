// src/views/public/NewPasswordView.jsx
// Establecer nueva contraseña — usuario llega con token desde email de recovery
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './auth.css';

export default function NewPasswordView() {
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    // Requisitos de contraseña (computed desde state)
    const reqs = [
        { label: 'Mínimo 8 caracteres',       met: password.length >= 8 },
        { label: 'Incluir un número',          met: /\d/.test(password) },
        { label: 'Incluir una mayúscula',      met: /[A-Z]/.test(password) },
        { label: 'Incluir un carácter especial', met: /[^a-zA-Z0-9]/.test(password) },
    ];

    // Supabase establece la sesión automáticamente al llegar
    // desde el email de recovery con el token en el hash/URL.
    // Esperamos a que onAuthStateChange dispare PASSWORD_RECOVERY.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === 'PASSWORD_RECOVERY') {
                    setSessionReady(true);
                }
            }
        );

        // Si el usuario ya tiene sesión activa (recarga), permitir cambiar
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setSessionReady(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleUpdatePassword = async () => {
        setError('');

        if (!password || !confirmPassword) {
            setError('Completa todos los campos');
            return;
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password,
            });

            if (updateError) {
                setError(updateError.message);
                return;
            }

            setSuccess(true);
        } catch (err) {
            console.error('[NewPasswordView] Error inesperado:', err);
            setError('Ocurrió un error. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const sharedHeader = (
        <header className="recovery-header">
            <button
                className="register-nav-btn"
                onClick={() => navigate('/login')}
                aria-label="Volver"
            >
                <span className="material-symbols-rounded">arrow_back</span>
            </button>
            <div className="recovery-header-spacer" />
        </header>
    );

    // ─── Estado de éxito ───
    if (success) {
        return (
            <div className="newpassword-screen">
                {sharedHeader}
                <main className="recovery-container">
                    <div className="newpassword-success">
                        <div className="newpassword-success-icon">
                            <span className="material-symbols-rounded">check_circle</span>
                        </div>
                        <h1 className="newpassword-title">¡Contraseña actualizada!</h1>
                        <p className="newpassword-subtitle">
                            Tu contraseña se ha cambiado correctamente.
                            Ya puedes iniciar sesión con tu nueva contraseña.
                        </p>
                    </div>
                    <button
                        className="auth-btn auth-btn--primary"
                        type="button"
                        onClick={() => navigate('/login', { replace: true })}
                    >
                        Ir a Iniciar sesión
                    </button>
                </main>
            </div>
        );
    }

    // ─── Sin sesión válida (token no aplicado aún) ───
    if (!sessionReady) {
        return (
            <div className="newpassword-screen">
                {sharedHeader}
                <main className="recovery-container">
                    <div className="newpassword-success">
                        <div className="newpassword-success-icon newpassword-success-icon--waiting">
                            <span className="material-symbols-rounded">hourglass_top</span>
                        </div>
                        <h1 className="newpassword-title">Verificando enlace…</h1>
                        <p className="newpassword-subtitle">
                            Estamos verificando tu enlace de recuperación.
                            Si no funciona, solicita uno nuevo.
                        </p>
                    </div>
                    <button
                        className="auth-btn auth-btn--outline"
                        type="button"
                        onClick={() => navigate('/recovery')}
                    >
                        Solicitar nuevo enlace
                    </button>
                </main>
            </div>
        );
    }

    // ─── Formulario ───
    return (
        <div className="newpassword-screen">
            {/* Blobs decorativos */}
            <div className="newpassword-blob newpassword-blob--tr" />
            <div className="newpassword-blob newpassword-blob--bl" />

            {sharedHeader}

            <main className="recovery-container">

                {/* Título */}
                <div className="newpassword-title-section">
                    <h1 className="newpassword-title">Crea tu nueva contraseña</h1>
                    <p className="newpassword-subtitle">
                        Asegúrate de que sea segura y fácil de recordar.
                    </p>
                </div>

                {/* Nueva contraseña */}
                <div className="auth-field">
                    <label className="auth-label" htmlFor="new-password">Nueva contraseña</label>
                    <div className="auth-input-wrapper">
                        <span className="material-symbols-rounded auth-input-icon">lock</span>
                        <input
                            id="new-password"
                            className="auth-input"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Introduce tu contraseña"
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

                {/* Confirmar contraseña */}
                <div className="auth-field">
                    <label className="auth-label" htmlFor="confirm-new-password">
                        Confirmar contraseña
                    </label>
                    <div className="auth-input-wrapper">
                        <span className="material-symbols-rounded auth-input-icon">lock</span>
                        <input
                            id="confirm-new-password"
                            className="auth-input"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Repite tu contraseña"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="auth-toggle-password"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                        >
                            <span className="material-symbols-rounded">
                                {showConfirmPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Requisitos de seguridad */}
                <div className="newpassword-requirements">
                    <h3 className="newpassword-req-title">
                        <span className="material-symbols-rounded">shield</span>
                        Requisitos de seguridad
                    </h3>
                    <ul className="newpassword-req-list">
                        {reqs.map(({ label, met }) => (
                            <li key={label} className={`newpassword-req-item${met ? ' newpassword-req-item--met' : ''}`}>
                                <div className={`newpassword-req-dot${met ? ' newpassword-req-dot--met' : ''}`}>
                                    <span className="material-symbols-rounded">
                                        {met ? 'check' : 'circle'}
                                    </span>
                                </div>
                                <span>{label}</span>
                            </li>
                        ))}
                    </ul>
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
                    onClick={handleUpdatePassword}
                    disabled={loading}
                >
                    {loading ? 'Actualizando…' : 'Restablecer contraseña'}
                </button>

            </main>
        </div>
    );
}
