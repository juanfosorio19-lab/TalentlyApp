// src/views/company/CompanySettingsView.jsx
// Configuración de cuenta/app — diseño Stitch.
// El perfil de empresa (hero, valores, tech stack, beneficios) vive en la
// pestaña Perfil del dashboard (CompanyProfileSections), no aquí
// (feedback 2026-09-21).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useApp, Actions } from '../../context/AppContext';
import { APP_VERSION } from '../../lib/constants';
import './CompanySettingsView.css';

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
        <div className="csv">
            {/* ── Header ── */}
            <header className="csv__header">
                <button
                    className="csv__header-btn"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h1 className="csv__header-title">Configuración</h1>
                <div className="csv__header-btn" style={{ visibility: 'hidden' }} />
            </header>

            {/* ── Scroll ── */}
            <div className="csv__scroll">

                {/* ────────── SETTINGS ────────── */}

                {/* ── Cuenta ── */}
                <div className="csv__section">
                    <p className="csv__section-label">Cuenta</p>
                    <div className="csv__group">
                        <div className="csv__row csv__row--static">
                            <div className="csv__row-icon csv__row-icon--blue">
                                <span className="material-symbols-rounded">mail</span>
                            </div>
                            <div className="csv__row-info">
                                <p className="csv__row-title">Email</p>
                                <p className="csv__row-sub">{currentUser?.email || '—'}</p>
                            </div>
                        </div>

                        <button className="csv__row" onClick={handleChangePassword}>
                            <div className="csv__row-icon csv__row-icon--muted">
                                <span className="material-symbols-rounded">lock_reset</span>
                            </div>
                            <div className="csv__row-info">
                                <p className="csv__row-title">Cambiar contraseña</p>
                                {pwMsg && <p className="csv__row-sub csv__row-sub--ok">{pwMsg}</p>}
                            </div>
                            <span className="material-symbols-rounded csv__chevron">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* ── Empresa ── */}
                <div className="csv__section">
                    <p className="csv__section-label">Empresa</p>
                    <div className="csv__group">
                        <div className="csv__row csv__row--static">
                            <div className="csv__row-icon csv__row-icon--blue">
                                <span className="material-symbols-rounded">business</span>
                            </div>
                            <div className="csv__row-info">
                                <p className="csv__row-title">Nombre de la empresa</p>
                                <p className="csv__row-sub">{userProfile?.company_name || '—'}</p>
                            </div>
                        </div>

                        <button className="csv__row" onClick={() => navigate('/company/create-offer')}>
                            <div className="csv__row-icon csv__row-icon--green">
                                <span className="material-symbols-rounded">add_circle</span>
                            </div>
                            <div className="csv__row-info">
                                <p className="csv__row-title">Nueva oferta</p>
                                <p className="csv__row-sub">Publica una nueva vacante</p>
                            </div>
                            <span className="material-symbols-rounded csv__chevron">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* ── Preferencias ── */}
                <div className="csv__section">
                    <p className="csv__section-label">Preferencias</p>
                    <div className="csv__group">
                        <div className="csv__row csv__row--static">
                            <div className="csv__row-icon csv__row-icon--muted">
                                <span className="material-symbols-rounded">
                                    {darkMode ? 'dark_mode' : 'light_mode'}
                                </span>
                            </div>
                            <div className="csv__row-info">
                                <p className="csv__row-title">Modo oscuro</p>
                            </div>
                            <button
                                className={`csv__toggle ${darkMode ? 'csv__toggle--on' : ''}`}
                                onClick={handleToggleDark}
                                aria-label={darkMode ? 'Desactivar modo oscuro' : 'Activar modo oscuro'}
                                role="switch"
                                aria-checked={darkMode}
                            >
                                <span className="csv__toggle-thumb" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Sobre Talently ── */}
                <div className="csv__section">
                    <p className="csv__section-label">Sobre Talently</p>
                    <div className="csv__group">
                        <button className="csv__row" onClick={() => navigate('/support')}>
                            <div className="csv__row-icon csv__row-icon--amber">
                                <span className="material-symbols-rounded">headset_mic</span>
                            </div>
                            <div className="csv__row-info">
                                <p className="csv__row-title">Contactar soporte</p>
                            </div>
                            <span className="material-symbols-rounded csv__chevron">chevron_right</span>
                        </button>

                        <button className="csv__row" onClick={() => navigate('/faq')}>
                            <div className="csv__row-icon csv__row-icon--blue">
                                <span className="material-symbols-rounded">help_outline</span>
                            </div>
                            <div className="csv__row-info">
                                <p className="csv__row-title">Preguntas frecuentes</p>
                            </div>
                            <span className="material-symbols-rounded csv__chevron">chevron_right</span>
                        </button>

                        <button className="csv__row" onClick={() => navigate('/privacy')}>
                            <div className="csv__row-icon csv__row-icon--muted">
                                <span className="material-symbols-rounded">policy</span>
                            </div>
                            <div className="csv__row-info">
                                <p className="csv__row-title">Política de privacidad</p>
                            </div>
                            <span className="material-symbols-rounded csv__chevron">chevron_right</span>
                        </button>
                        <div className="csv__row csv__row--static">
                            <div className="csv__row-icon csv__row-icon--muted">
                                <span className="material-symbols-rounded">info</span>
                            </div>
                            <div className="csv__row-info">
                                <p className="csv__row-title">Versión</p>
                                <p className="csv__row-sub">v{APP_VERSION}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Zona de peligro ── */}
                <div className="csv__section">
                    <p className="csv__section-label">Zona de peligro</p>
                    <div className="csv__group">
                        <button className="csv__row csv__row--danger" onClick={() => navigate('/delete-account')}>
                            <div className="csv__row-icon csv__row-icon--danger">
                                <span className="material-symbols-rounded">delete_forever</span>
                            </div>
                            <div className="csv__row-info">
                                <p className="csv__row-title csv__row-title--danger">Eliminar cuenta</p>
                                <p className="csv__row-sub">Esta acción es irreversible</p>
                            </div>
                            <span className="material-symbols-rounded csv__chevron">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* ── Cerrar sesión ── */}
                <button className="csv__signout-btn" onClick={handleSignOut}>
                    <span className="material-symbols-rounded">logout</span>
                    Cerrar sesión
                </button>

                <p className="csv__version-footer">Talently v{APP_VERSION}</p>
                <div style={{ height: 100 }} />
            </div>



        </div>
    );
}
