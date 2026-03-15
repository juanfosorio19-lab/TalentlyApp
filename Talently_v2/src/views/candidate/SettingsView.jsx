// src/views/candidate/SettingsView.jsx
// Configuración del candidato — diseño Stitch
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useApp, Actions } from '../../context/AppContext';
import { APP_VERSION } from '../../lib/constants';
import './SettingsView.css';

export default function SettingsView() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const { darkMode, userProfile, currentUser } = state;
    const [pwMsg, setPwMsg] = useState('');

    const handleToggleDark = () => {
        dispatch({ type: Actions.TOGGLE_DARK_MODE });
    };

    const handleChangePassword = async () => {
        const email = currentUser?.email;
        if (!email) return;
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback`,
        });
        setPwMsg('Te enviamos un email para cambiar tu contraseña.');
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        dispatch({ type: Actions.LOGOUT });
        navigate('/', { replace: true });
    };

    return (
        <div className="sv">
            {/* Drag handle */}
            <div className="sv__drag-handle" />

            {/* ── Header ── */}
            <header className="sv__header">
                <button
                    className="sv__back"
                    onClick={() => navigate('/app')}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h1 className="sv__title">Configuración</h1>
                <div className="sv__header-spacer" />
            </header>

            {/* ── Scroll ── */}
            <div className="sv__scroll">

                {/* ── Cuenta ── */}
                <section className="sv__section">
                    <h3 className="sv__section-label">Cuenta</h3>
                    <div className="sv__group">

                        {/* Email (read-only) */}
                        <div className="sv__row sv__row--static">
                            <div className="sv__icon sv__icon--blue">
                                <span className="material-symbols-rounded">mail</span>
                            </div>
                            <div className="sv__info">
                                <p className="sv__info-sub">Correo electrónico</p>
                                <p className="sv__info-title">{currentUser?.email || '—'}</p>
                            </div>
                        </div>

                        {/* Cambiar contraseña */}
                        <button className="sv__row" onClick={handleChangePassword}>
                            <div className="sv__icon sv__icon--green">
                                <span className="material-symbols-rounded">lock_reset</span>
                            </div>
                            <div className="sv__info">
                                <p className="sv__info-title">Cambiar contraseña</p>
                                {pwMsg && <p className="sv__info-sub sv__info-sub--success">{pwMsg}</p>}
                            </div>
                            <span className="material-symbols-rounded sv__chevron">chevron_right</span>
                        </button>

                        {/* Mi perfil */}
                        {userProfile && (
                            <button className="sv__row" onClick={() => navigate('/app/profile')}>
                                <div className="sv__icon sv__icon--blue">
                                    <span className="material-symbols-rounded">person</span>
                                </div>
                                <div className="sv__info">
                                    <p className="sv__info-title">Mi perfil</p>
                                    <p className="sv__info-sub">
                                        {userProfile.full_name || 'Completa tu perfil'}
                                    </p>
                                </div>
                                <span className="material-symbols-rounded sv__chevron">chevron_right</span>
                            </button>
                        )}

                        {/* Mi CV */}
                        {userProfile && (
                            <button className="sv__row" onClick={() => navigate('/app/cv')}>
                                <div className="sv__icon sv__icon--blue">
                                    <span className="material-symbols-rounded">description</span>
                                </div>
                                <div className="sv__info">
                                    <p className="sv__info-title">Mi CV</p>
                                    <p className="sv__info-sub">
                                        {userProfile.cv_url ? 'CV subido' : 'Sin CV todavía'}
                                    </p>
                                </div>
                                <span className="material-symbols-rounded sv__chevron">chevron_right</span>
                            </button>
                        )}
                    </div>
                </section>

                {/* ── Apariencia ── */}
                <section className="sv__section">
                    <h3 className="sv__section-label">Apariencia</h3>
                    <div className="sv__group">
                        <div className="sv__row sv__row--static">
                            <div className="sv__icon sv__icon--purple">
                                <span className="material-symbols-rounded">dark_mode</span>
                            </div>
                            <div className="sv__info">
                                <p className="sv__info-title">Modo oscuro</p>
                            </div>
                            <button
                                className={`sv__toggle ${darkMode ? 'sv__toggle--on' : ''}`}
                                onClick={handleToggleDark}
                                aria-label={darkMode ? 'Desactivar modo oscuro' : 'Activar modo oscuro'}
                                role="switch"
                                aria-checked={darkMode}
                            >
                                <span className="sv__toggle__thumb" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Explorar ── */}
                <section className="sv__section">
                    <h3 className="sv__section-label">Explorar</h3>
                    <div className="sv__group">
                        <button className="sv__row" onClick={() => navigate('/app/filters')}>
                            <div className="sv__icon sv__icon--green">
                                <span className="material-symbols-rounded">tune</span>
                            </div>
                            <div className="sv__info">
                                <p className="sv__info-title">Filtros de búsqueda</p>
                                <p className="sv__info-sub">Modalidad, área, salario</p>
                            </div>
                            <span className="material-symbols-rounded sv__chevron">chevron_right</span>
                        </button>

                        <button className="sv__row" onClick={() => navigate('/onboarding/candidate')}>
                            <div className="sv__icon sv__icon--amber">
                                <span className="material-symbols-rounded">edit_note</span>
                            </div>
                            <div className="sv__info">
                                <p className="sv__info-title">Completar / editar onboarding</p>
                                <p className="sv__info-sub">Actualiza tus datos de perfil</p>
                            </div>
                            <span className="material-symbols-rounded sv__chevron">chevron_right</span>
                        </button>
                    </div>
                </section>

                {/* ── Cerrar sesión ── */}
                <div className="sv__section sv__section--no-label">
                    <button className="sv__signout-btn" onClick={handleSignOut}>
                        <span className="material-symbols-rounded">logout</span>
                        Cerrar Sesión
                    </button>
                </div>

                {/* ── Acerca de Talently ── */}
                <section className="sv__section">
                    <h3 className="sv__section-label">Acerca de Talently</h3>
                    <div className="sv__group">
                        <button className="sv__row" onClick={() => alert('Próximamente')}>
                            <div className="sv__icon sv__icon--muted">
                                <span className="material-symbols-rounded">policy</span>
                            </div>
                            <div className="sv__info">
                                <p className="sv__info-title">Política de privacidad</p>
                            </div>
                            <span className="material-symbols-rounded sv__chevron">open_in_new</span>
                        </button>
                    </div>
                </section>

                <p className="sv__version">Talently {APP_VERSION}</p>
            </div>
        </div>
    );
}
