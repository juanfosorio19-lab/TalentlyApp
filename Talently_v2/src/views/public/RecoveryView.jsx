// src/views/public/RecoveryView.jsx
// Recuperación de contraseña — envía email con link de reset
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './auth.css';

export default function RecoveryView() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRecovery = async () => {
        setError('');

        if (!email) {
            setError('Ingresa tu email');
            return;
        }

        setLoading(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/new-password`,
            });

            if (resetError) {
                setError(resetError.message);
                return;
            }

            setSuccess(true);
        } catch (err) {
            console.error('[RecoveryView] Error inesperado:', err);
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
            <span className="recovery-header-title">Recuperar contraseña</span>
            <div className="recovery-header-spacer" />
        </header>
    );

    // ─── Estado de éxito ───
    if (success) {
        return (
            <div className="recovery-screen">
                {sharedHeader}
                <main className="recovery-container">
                    <div className="auth-success">
                        <span className="material-symbols-rounded">check_circle</span>
                        Revisa tu correo: Hemos enviado las instrucciones.
                    </div>

                    <div className="recovery-hero">
                        <div className="recovery-icon-group">
                            <div className="recovery-icon-circle recovery-icon-circle--email">
                                <span className="material-symbols-rounded">mark_email_read</span>
                            </div>
                        </div>
                        <h1 className="recovery-title">Revisa tu email</h1>
                        <p className="recovery-subtitle">
                            Enviamos un enlace de recuperación a <strong>{email}</strong>.
                            Revisa tu bandeja de entrada y spam.
                        </p>
                    </div>

                    <button
                        className="auth-btn auth-btn--primary"
                        type="button"
                        onClick={() => navigate('/login')}
                    >
                        Volver a Iniciar sesión
                    </button>
                </main>
            </div>
        );
    }

    // ─── Formulario ───
    return (
        <div className="recovery-screen">
            {sharedHeader}
            <main className="recovery-container">

                {/* Sección visual: íconos decorativos + título + subtítulo */}
                <div className="recovery-hero">
                    <div className="recovery-icon-group">
                        <div className="recovery-icon-circle recovery-icon-circle--email">
                            <span className="material-symbols-rounded">mail</span>
                        </div>
                        <div className="recovery-icon-circle recovery-icon-circle--lock">
                            <span className="material-symbols-rounded">lock</span>
                        </div>
                    </div>
                    <h1 className="recovery-title">Recuperar contraseña</h1>
                    <p className="recovery-subtitle">
                        Ingresa tu correo electrónico para recibir las instrucciones de recuperación.
                    </p>
                </div>

                {/* Email */}
                <div className="auth-field">
                    <label className="auth-label" htmlFor="recovery-email">
                        Correo electrónico
                    </label>
                    <div className="auth-input-wrapper">
                        <span className="material-symbols-rounded auth-input-icon">mail</span>
                        <input
                            id="recovery-email"
                            name="email"
                            className="auth-input"
                            type="email"
                            placeholder="ejemplo@talently.tech"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
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
                    onClick={handleRecovery}
                    disabled={loading}
                >
                    {loading ? 'Enviando…' : 'Enviar instrucciones'}
                </button>

                {/* Footer */}
                <p className="auth-footer-text recovery-footer-link">
                    <button
                        type="button"
                        className="auth-link-btn"
                        onClick={() => navigate('/login')}
                    >
                        Volver al inicio de sesión
                    </button>
                </p>

            </main>
        </div>
    );
}
