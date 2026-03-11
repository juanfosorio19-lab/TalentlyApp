// src/views/company/CompanySettingsView.jsx
// Configuración de empresa: dark mode, links rápidos, cerrar sesión.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useApp, Actions } from '../../context/AppContext';
// Reutiliza los estilos de SettingsView del candidato
import '../candidate/SettingsView.css';

const APP_VERSION = '1.0.0';

export default function CompanySettingsView() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const { darkMode, currentUser, userProfile } = state;
    const [pwMsg, setPwMsg] = useState('');

    const handleChangePassword = async () => {
        const email = currentUser?.email;
        if (!email) return;
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback`,
        });
        setPwMsg('Te enviamos un email para cambiar tu contraseña');
    };

    const handleToggleDark = () => {
        dispatch({ type: Actions.TOGGLE_DARK_MODE });
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        dispatch({ type: Actions.LOGOUT });
        navigate('/', { replace: true });
    };

    return (
        <div className="settings-view">
            <header className="settings-view__header">
                <button
                    className="settings-view__back"
                    onClick={() => navigate('/company/dashboard')}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h2 className="settings-view__title">Configuración</h2>
            </header>

            <div className="settings-view__scroll">
                {/* ── Cuenta ── */}
                <div className="settings-section">
                    <p className="settings-section__label">Cuenta</p>
                    <div className="settings-section__group">
                        {/* Email solo lectura */}
                        <div className="settings-row settings-row--static">
                            <div className="settings-row__icon settings-row__icon--primary">
                                <span className="material-symbols-rounded">mail</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Email</p>
                                <p className="settings-row__sub">{currentUser?.email || '—'}</p>
                            </div>
                        </div>

                        {/* Cambiar contraseña */}
                        <button className="settings-row" onClick={handleChangePassword}>
                            <div className="settings-row__icon settings-row__icon--neutral">
                                <span className="material-symbols-rounded">lock_reset</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Cambiar contraseña</p>
                                {pwMsg && <p className="settings-row__sub settings-row__sub--success">{pwMsg}</p>}
                            </div>
                            <span className="material-symbols-rounded settings-row__chevron">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* ── Empresa ── */}
                <div className="settings-section">
                    <p className="settings-section__label">Empresa</p>
                    <div className="settings-section__group">
                        {/* Nombre empresa solo lectura */}
                        <div className="settings-row settings-row--static">
                            <div className="settings-row__icon settings-row__icon--primary">
                                <span className="material-symbols-rounded">business</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Nombre de la empresa</p>
                                <p className="settings-row__sub">{userProfile?.company_name || '—'}</p>
                            </div>
                        </div>

                        {/* Editar perfil */}
                        <button className="settings-row" onClick={() => navigate('/company/dashboard')}>
                            <div className="settings-row__icon settings-row__icon--warning">
                                <span className="material-symbols-rounded">edit_note</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Editar perfil de empresa</p>
                                <p className="settings-row__sub">Actualiza la información de tu empresa</p>
                            </div>
                            <span className="material-symbols-rounded settings-row__chevron">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* ── Ofertas ── */}
                <div className="settings-section">
                    <p className="settings-section__label">Ofertas</p>
                    <div className="settings-section__group">
                        <button
                            className="settings-row"
                            onClick={() => navigate('/company/create-offer')}
                        >
                            <div className="settings-row__icon settings-row__icon--success">
                                <span className="material-symbols-rounded">add_circle</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Nueva oferta</p>
                                <p className="settings-row__sub">Publica una nueva vacante</p>
                            </div>
                            <span className="material-symbols-rounded settings-row__chevron">
                                chevron_right
                            </span>
                        </button>
                    </div>
                </div>

                {/* ── Preferencias ── */}
                <div className="settings-section">
                    <p className="settings-section__label">Preferencias</p>
                    <div className="settings-section__group">
                        <div className="settings-row settings-row--static">
                            <div className="settings-row__icon settings-row__icon--neutral">
                                <span className="material-symbols-rounded">
                                    {darkMode ? 'dark_mode' : 'light_mode'}
                                </span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Modo oscuro</p>
                            </div>
                            <button
                                className={`settings-toggle ${darkMode ? 'settings-toggle--on' : ''}`}
                                onClick={handleToggleDark}
                                aria-label={darkMode ? 'Desactivar modo oscuro' : 'Activar modo oscuro'}
                                role="switch"
                                aria-checked={darkMode}
                            >
                                <span className="settings-toggle__thumb" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Sesión ── */}
                <div className="settings-section">
                    <p className="settings-section__label">Sesión</p>
                    <div className="settings-section__group">
                        <button
                            className="settings-row settings-row--danger"
                            onClick={handleSignOut}
                        >
                            <div className="settings-row__icon settings-row__icon--danger">
                                <span className="material-symbols-rounded">logout</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Cerrar sesión</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* ── Sobre Talently ── */}
                <div className="settings-section">
                    <p className="settings-section__label">Sobre Talently</p>
                    <div className="settings-section__group">
                        <button
                            className="settings-row"
                            onClick={() => alert('Próximamente')}
                        >
                            <div className="settings-row__icon settings-row__icon--neutral">
                                <span className="material-symbols-rounded">policy</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Política de privacidad</p>
                            </div>
                            <span className="material-symbols-rounded settings-row__chevron">chevron_right</span>
                        </button>

                        <div className="settings-row settings-row--static">
                            <div className="settings-row__icon settings-row__icon--neutral">
                                <span className="material-symbols-rounded">info</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Versión</p>
                                <p className="settings-row__sub">v{APP_VERSION}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="settings-version">Talently v{APP_VERSION}</p>
            </div>
        </div>
    );
}
