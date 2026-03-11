// src/views/candidate/SettingsView.jsx
// Configuración del candidato: dark mode, links rápidos, cerrar sesión.
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useApp, Actions } from '../../context/AppContext';
import './SettingsView.css';

const APP_VERSION = '2.0.0';

export default function SettingsView() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const { darkMode, userProfile } = state;

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
                    onClick={() => navigate('/app')}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h2 className="settings-view__title">Configuración</h2>
            </header>

            <div className="settings-view__scroll">
                {/* ── Cuenta ── */}
                {userProfile && (
                    <div className="settings-section">
                        <p className="settings-section__label">Cuenta</p>
                        <div className="settings-section__group">
                            <button
                                className="settings-row"
                                onClick={() => navigate('/app/profile')}
                            >
                                <div className="settings-row__icon settings-row__icon--primary">
                                    <span className="material-symbols-rounded">person</span>
                                </div>
                                <div className="settings-row__info">
                                    <p className="settings-row__title">Mi perfil</p>
                                    <p className="settings-row__sub">
                                        {userProfile.full_name || 'Completa tu perfil'}
                                    </p>
                                </div>
                                <span className="material-symbols-rounded settings-row__chevron">
                                    chevron_right
                                </span>
                            </button>

                            <button
                                className="settings-row"
                                onClick={() => navigate('/app/cv')}
                            >
                                <div className="settings-row__icon settings-row__icon--primary">
                                    <span className="material-symbols-rounded">description</span>
                                </div>
                                <div className="settings-row__info">
                                    <p className="settings-row__title">Mi CV</p>
                                    <p className="settings-row__sub">
                                        {userProfile.cv_url ? 'CV subido' : 'Sin CV todavía'}
                                    </p>
                                </div>
                                <span className="material-symbols-rounded settings-row__chevron">
                                    chevron_right
                                </span>
                            </button>
                        </div>
                    </div>
                )}

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

                {/* ── Explorar ── */}
                <div className="settings-section">
                    <p className="settings-section__label">Explorar</p>
                    <div className="settings-section__group">
                        <button
                            className="settings-row"
                            onClick={() => navigate('/app/filters')}
                        >
                            <div className="settings-row__icon settings-row__icon--success">
                                <span className="material-symbols-rounded">tune</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Filtros de búsqueda</p>
                                <p className="settings-row__sub">Modalidad, área, salario</p>
                            </div>
                            <span className="material-symbols-rounded settings-row__chevron">
                                chevron_right
                            </span>
                        </button>

                        <button
                            className="settings-row"
                            onClick={() => navigate('/onboarding/candidate')}
                        >
                            <div className="settings-row__icon settings-row__icon--warning">
                                <span className="material-symbols-rounded">edit_note</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Completar / editar onboarding</p>
                                <p className="settings-row__sub">Actualiza tus datos de perfil</p>
                            </div>
                            <span className="material-symbols-rounded settings-row__chevron">
                                chevron_right
                            </span>
                        </button>
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

                <p className="settings-version">Talently v{APP_VERSION}</p>
            </div>
        </div>
    );
}
