// src/views/company/CompanySettingsView.jsx
// Configuración + perfil de empresa — diseño Stitch
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '../../lib/supabase';
import { logError } from '../../lib/errorLogger';
import { useApp, Actions } from '../../context/AppContext';
import { APP_VERSION } from '../../lib/constants';
import SectionEditModal from '../../components/profile/SectionEditModal';
import './CompanySettingsView.css';

const BENEFIT_ICONS = {
    'Seguro médico': 'medical_services', 'Seguro de salud': 'medical_services',
    'Dental': 'volunteer_activism', 'Stock Options': 'trending_up',
    'Horario flexible': 'schedule', 'Presupuesto formación': 'school',
    'Formación': 'school', 'Comida gratis': 'restaurant',
    'Pet friendly': 'pets', 'Gimnasio': 'fitness_center',
    'Seguro de vida': 'shield', 'Bonus': 'monetization_on',
    'Vacaciones extra': 'beach_access', 'Home Office': 'home_work',
    'Trabajo remoto': 'laptop_chromebook',
};

export default function CompanySettingsView() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const { darkMode, currentUser, userProfile } = state;

    const [pwMsg, setPwMsg] = useState('');
    const [stats, setStats] = useState({ offers: 0, matches: 0, views: 0 });

    // ── Edición de perfil ──
    const [showEdit, setShowEdit] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [editSection, setEditSection] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const logoInputRef = useRef(null);

    const openEdit = () => {
        setEditData({
            company_name:        userProfile?.company_name || '',
            company_description: userProfile?.company_description || '',
            company_sector:      userProfile?.company_sector || '',
            website:             userProfile?.website || '',
            city:                userProfile?.city || '',
            country:             userProfile?.country || '',
            company_stage:       userProfile?.company_stage || '',
            company_size:        userProfile?.company_size || '',
        });
        setShowEdit(true);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const { data: updated, error } = await db.profiles.create({ ...userProfile, ...editData });
            if (error) { logError('COMPANY_PROFILE_SAVE', error.message, { code: error.code }); return; }
            if (updated) dispatch({ type: Actions.SET_PROFILE, payload: updated });
            setShowEdit(false);
        } catch (err) {
            logError('COMPANY_PROFILE_SAVE_THROW', err?.message || String(err), { stack: err?.stack });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSection = async (items) => {
        setSaving(true);
        try {
            const { data: updated, error } = await db.profiles.create({ ...userProfile, [editSection]: items });
            if (error) { logError('COMPANY_SECTION_SAVE', error.message, { section: editSection }); return; }
            if (updated) dispatch({ type: Actions.SET_PROFILE, payload: updated });
            setEditSection(null);
        } catch (err) {
            logError('COMPANY_SECTION_SAVE_THROW', err?.message || String(err), { section: editSection });
        } finally {
            setSaving(false);
        }
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingLogo(true);
        try {
            const publicUrl = await db.storage.uploadImage(file, 'images');
            if (!publicUrl) { logError('COMPANY_LOGO_UPLOAD', 'uploadImage devolvió null'); return; }
            const { data: updated, error } = await db.profiles.create({ ...userProfile, company_logo: publicUrl });
            if (error) { logError('COMPANY_LOGO_SAVE', error.message); return; }
            if (updated) dispatch({ type: Actions.SET_PROFILE, payload: updated });
        } catch (err) {
            logError('COMPANY_LOGO_THROW', err?.message || String(err));
        } finally {
            setUploadingLogo(false);
            if (logoInputRef.current) logoInputRef.current.value = '';
        }
    };

    // ── Cargar contadores rápidos ──
    useEffect(() => {
        if (!currentUser?.id) return;
        let isMounted = true;
        const load = async () => {
            try {
                const [offersRes, matchesRes, statsRes] = await Promise.all([
                    db.offers.getByCompany(currentUser.id),
                    db.matches.get(),
                    db.statistics.get(),
                ]);
                if (!isMounted) return;
                setStats({
                    offers:  (offersRes.data || []).filter((o) => o.status === 'active').length,
                    matches: (matchesRes.data || []).length,
                    views:   statsRes.data?.profile_views || 0,
                });
            } catch {
                // silencioso
            }
        };
        load();
        return () => { isMounted = false; };
    }, [currentUser?.id]);

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

    const logo        = userProfile?.company_logo || userProfile?.company_logo_url;
    const companyName = userProfile?.company_name || 'Tu empresa';
    const techStack   = userProfile?.company_tech_stack || [];
    const benefits    = userProfile?.benefits || userProfile?.company_benefits || [];
    const values      = userProfile?.company_values || userProfile?.culture_values || [];

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
                <button
                    className="csv__header-btn csv__header-btn--primary"
                    onClick={openEdit}
                    aria-label="Editar perfil"
                >
                    <span className="material-symbols-rounded">edit_square</span>
                </button>
            </header>

            {/* ── Scroll ── */}
            <div className="csv__scroll">

                {/* ── Hero card ── */}
                <div className="csv__hero">
                    <div className="csv__logo-wrap">
                        {logo ? (
                            <img className="csv__logo" src={logo} alt={companyName} />
                        ) : (
                            <div className="csv__logo-placeholder">
                                <span className="material-symbols-rounded">business</span>
                            </div>
                        )}
                        <button
                            type="button"
                            className="csv__logo-edit"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={uploadingLogo}
                            aria-label="Cambiar logo"
                        >
                            <span className="material-symbols-rounded">
                                {uploadingLogo ? 'hourglass_top' : 'photo_camera'}
                            </span>
                        </button>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleLogoChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <h2 className="csv__company-name">{companyName}</h2>

                    <div className="csv__hero-meta">
                        {userProfile?.company_sector && (
                            <span className="csv__sector-badge">
                                {userProfile.company_sector}
                            </span>
                        )}
                        {(userProfile?.city || userProfile?.country) && (
                            <span className="csv__location">
                                <span className="material-symbols-rounded csv__location-icon">location_on</span>
                                {[userProfile.city, userProfile.country].filter(Boolean).join(', ')}
                            </span>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="csv__stats">
                        <div className="csv__stat">
                            <span className="csv__stat-value">{stats.offers}</span>
                            <span className="csv__stat-label">Ofertas</span>
                        </div>
                        <div className="csv__stat-divider" />
                        <div className="csv__stat">
                            <span className="csv__stat-value">{stats.matches}</span>
                            <span className="csv__stat-label">Matches</span>
                        </div>
                        <div className="csv__stat-divider" />
                        <div className="csv__stat">
                            <span className="csv__stat-value">{stats.views}</span>
                            <span className="csv__stat-label">Visitas</span>
                        </div>
                    </div>
                </div>

                {/* ── Sobre nosotros ── */}
                {(userProfile?.company_description || userProfile?.website
                    || userProfile?.company_stage || userProfile?.company_size) && (
                    <div className="csv__card">
                        <h3 className="csv__card-title">Sobre Nosotros</h3>

                        {userProfile?.company_description && (
                            <p className="csv__description">{userProfile.company_description}</p>
                        )}

                        {/* Meta tags */}
                        <div className="csv__meta-tags">
                            {userProfile?.company_stage && (
                                <span className="csv__meta-tag">
                                    <span className="material-symbols-rounded csv__meta-tag-icon">rocket_launch</span>
                                    {userProfile.company_stage}
                                </span>
                            )}
                            {userProfile?.company_size && (
                                <span className="csv__meta-tag">
                                    <span className="material-symbols-rounded csv__meta-tag-icon">groups</span>
                                    {userProfile.company_size}
                                </span>
                            )}
                            {userProfile?.work_modalities?.[0] && (
                                <span className="csv__meta-tag">
                                    <span className="material-symbols-rounded csv__meta-tag-icon">public</span>
                                    {userProfile.work_modalities[0]}
                                </span>
                            )}
                        </div>

                        {userProfile?.website && (
                            <div className="csv__links">
                                <span className="csv__link">
                                    <span className="material-symbols-rounded csv__link-icon">language</span>
                                    {userProfile.website}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Valores de cultura ── */}
                <div className="csv__card">
                    <div className="csv__card-header">
                        <h3 className="csv__card-title">Valores de Cultura</h3>
                        <button className="csv__card-edit" onClick={() => setEditSection('culture_values')} aria-label="Editar valores">
                            <span className="material-symbols-rounded">edit</span>
                        </button>
                    </div>
                    {values.length > 0 ? (
                        <div className="csv__chips-wrap">
                            {values.map((v, i) => (
                                <span key={i} className={`csv__value-chip csv__value-chip--${i % 4}`}>{v}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="csv__section-empty" onClick={() => setEditSection('culture_values')}>+ Agrega los valores de tu empresa</p>
                    )}
                </div>

                {/* ── Tech stack ── */}
                <div className="csv__card">
                    <div className="csv__card-header">
                        <h3 className="csv__card-title">Tech Stack</h3>
                        <button className="csv__card-edit" onClick={() => setEditSection('company_tech_stack')} aria-label="Editar tech stack">
                            <span className="material-symbols-rounded">edit</span>
                        </button>
                    </div>
                    {techStack.length > 0 ? (
                        <div className="csv__chips-wrap">
                            {techStack.map((t) => (
                                <span key={t} className="csv__tech-chip">{t}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="csv__section-empty" onClick={() => setEditSection('company_tech_stack')}>+ Agrega tu stack tecnológico</p>
                    )}
                </div>

                {/* ── Beneficios ── */}
                <div className="csv__card">
                    <div className="csv__card-header">
                        <h3 className="csv__card-title">Beneficios</h3>
                        <button className="csv__card-edit" onClick={() => setEditSection('company_benefits')} aria-label="Editar beneficios">
                            <span className="material-symbols-rounded">edit</span>
                        </button>
                    </div>
                    {benefits.length > 0 ? (
                        <div className="csv__benefits-grid">
                            {benefits.slice(0, 6).map((b, i) => {
                                const icon = BENEFIT_ICONS[b] || 'star';
                                return (
                                    <div key={i} className="csv__benefit-item">
                                        <span className="material-symbols-rounded csv__benefit-icon">{icon}</span>
                                        <p className="csv__benefit-name">{b}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="csv__section-empty" onClick={() => setEditSection('company_benefits')}>+ Agrega los beneficios que ofreces</p>
                    )}
                </div>

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

            {/* ── Sticky footer: Editar perfil ── */}
            <div className="csv__footer">
                <button
                    className="csv__edit-btn"
                    onClick={openEdit}
                >
                    <span className="material-symbols-rounded">edit</span>
                    Editar Perfil
                </button>
            </div>

            {/* ══════ MODAL EDICIÓN DE TEXTO (reusa estilos sem-*) ══════ */}
            {showEdit && (
                <div className="sem-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEdit(false); }}>
                    <div className="sem-modal">
                        <div className="sem-modal__header">
                            <h3 className="sem-modal__title">Editar perfil de empresa</h3>
                            <button className="sem-modal__close" onClick={() => setShowEdit(false)} aria-label="Cerrar">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        <div className="sem-modal__body">
                            {[
                                { key: 'company_name',   label: 'Nombre de la empresa', placeholder: 'Ej: Talently' },
                                { key: 'company_sector', label: 'Sector',               placeholder: 'Ej: Tecnología' },
                                { key: 'website',        label: 'Sitio web',            placeholder: 'https://…' },
                                { key: 'city',           label: 'Ciudad',               placeholder: 'Ej: Santiago' },
                                { key: 'country',        label: 'País',                 placeholder: 'Ej: Chile' },
                                { key: 'company_stage',  label: 'Etapa',                placeholder: 'Ej: Serie A' },
                                { key: 'company_size',   label: 'Tamaño',               placeholder: 'Ej: 11-50' },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key} className="sem-field">
                                    <label className="sem-label">{label}</label>
                                    <input
                                        className="sem-input"
                                        type="text"
                                        value={editData[key] || ''}
                                        onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                        placeholder={placeholder}
                                    />
                                </div>
                            ))}
                            <div className="sem-field">
                                <label className="sem-label">Descripción</label>
                                <textarea
                                    className="sem-input"
                                    rows={3}
                                    value={editData.company_description || ''}
                                    onChange={(e) => setEditData({ ...editData, company_description: e.target.value })}
                                    placeholder="Cuéntale a los candidatos sobre tu empresa…"
                                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>
                        <div className="sem-modal__footer">
                            <button className="sem-cancel" onClick={() => setShowEdit(false)} disabled={saving}>Cancelar</button>
                            <button className="sem-save" onClick={handleSaveProfile} disabled={saving}>
                                {saving ? 'Guardando…' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════ EDITOR DE SECCIONES DE LISTA ══════ */}
            {editSection && (
                <SectionEditModal
                    type={editSection}
                    initialItems={userProfile?.[editSection]}
                    onSave={handleSaveSection}
                    onClose={() => setEditSection(null)}
                    saving={saving}
                />
            )}
        </div>
    );
}
