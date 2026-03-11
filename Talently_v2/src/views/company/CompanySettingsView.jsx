// src/views/company/CompanySettingsView.jsx
// Configuración de empresa: dark mode, links rápidos, cerrar sesión.
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useApp, Actions } from '../../context/AppContext';
// Reutiliza los estilos de SettingsView del candidato
import '../candidate/SettingsView.css';

const APP_VERSION = '2.0.0';

export default function CompanySettingsView() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const { darkMode } = state;

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
                {/* ── Perfil ── */}
                <div className="settings-section">
                    <p className="settings-section__label">Empresa</p>
                    <div className="settings-section__group">
                        <button
                            className="settings-row"
                            onClick={() => navigate('/company/dashboard')}
                        >
                            <div className="settings-row__icon settings-row__icon--primary">
                                <span className="material-symbols-rounded">business</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Perfil de empresa</p>
                                <p className="settings-row__sub">Ver y editar información</p>
                            </div>
                            <span className="material-symbols-rounded settings-row__chevron">
                                chevron_right
                            </span>
                        </button>

                        <button
                            className="settings-row"
                            onClick={() => navigate('/onboarding/company')}
                        >
                            <div className="settings-row__icon settings-row__icon--warning">
                                <span className="material-symbols-rounded">edit_note</span>
                            </div>
                            <div className="settings-row__info">
                                <p className="settings-row__title">Editar onboarding</p>
                                <p className="settings-row__sub">Actualiza los datos de tu empresa</p>
                            </div>
                            <span className="material-symbols-rounded settings-row__chevron">
                                chevron_right
                            </span>
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

                <p className="settings-version">Talently v{APP_VERSION}</p>
            </div>
        </div>
    );
}
