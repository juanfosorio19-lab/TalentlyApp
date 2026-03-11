// src/views/candidate/ProfileView.jsx
// Perfil del candidato — lectura + edición básica + cierre de sesión.
// Accesible como vista standalone en /app/profile.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '../../lib/supabase';
import { useApp, Actions } from '../../context/AppContext';
import { MODALITY_LABELS, AVAILABILITY_LABELS } from '../../lib/constants';
import './ProfileView.css';

// isTab=true → sin header propio, height:100% (para embeber en MainApp)
export default function ProfileView({ isTab = false }) {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const { userProfile, currentUser } = state;

    const [loading, setLoading] = useState(!userProfile);
    const [showEdit, setShowEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({});

    // ── Cargar perfil si no está en AppContext ──
    useEffect(() => {
        if (userProfile || !currentUser) return;

        const loadProfile = async () => {
            setLoading(true);
            try {
                const { data } = await db.profiles.getById(currentUser.id);
                if (data) dispatch({ type: Actions.SET_PROFILE, payload: data });
            } catch (err) {
                console.error('[ProfileView] Error cargando perfil:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [currentUser, userProfile, dispatch]);

    // ── Inicializar form de edición con datos actuales ──
    const openEdit = () => {
        setEditData({
            full_name: userProfile?.full_name || '',
            headline: userProfile?.headline || '',
            city: userProfile?.city || '',
            salary_expectation: userProfile?.salary_expectation || '',
            work_modality: userProfile?.work_modality || '',
        });
        setShowEdit(true);
    };

    // ── Guardar edición básica ──
    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: updated } = await db.profiles.create({
                ...userProfile,
                ...editData,
            });
            if (updated) dispatch({ type: Actions.SET_PROFILE, payload: updated });
            setShowEdit(false);
        } catch (err) {
            console.error('[ProfileView] Error guardando perfil:', err);
        } finally {
            setSaving(false);
        }
    };

    // ── Cerrar sesión ──
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        dispatch({ type: Actions.LOGOUT });
        navigate('/', { replace: true });
    };

    // ── Inicial del nombre para avatar fallback ──
    const initial = (userProfile?.full_name || '?')[0].toUpperCase();

    // ── Loading state ──
    if (loading) {
        return (
            <div className={`profile-view profile-view--loading ${isTab ? 'profile-view--tab' : ''}`}>
                <div className="profile-view__spinner" />
            </div>
        );
    }

    const profile = userProfile || {};
    const skills = Array.isArray(profile.skills) ? profile.skills : [];
    const languages = Array.isArray(profile.languages) ? profile.languages : [];
    const experience = Array.isArray(profile.experience) ? profile.experience : [];
    const education = Array.isArray(profile.education) ? profile.education : [];
    const interests = Array.isArray(profile.interests) ? profile.interests : [];

    return (
        <div className={`profile-view ${isTab ? 'profile-view--tab' : ''}`}>
            {/* ── Header (solo en modo standalone) ── */}
            {!isTab && (
                <header className="profile-view__header">
                    <button
                        className="profile-view__header-btn"
                        onClick={() => navigate('/app')}
                        aria-label="Volver"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <span className="profile-view__header-title">Mi perfil</span>
                    <button
                        className="profile-view__header-btn profile-view__header-btn--signout"
                        onClick={handleSignOut}
                        aria-label="Cerrar sesión"
                        title="Cerrar sesión"
                    >
                        <span className="material-symbols-rounded">logout</span>
                    </button>
                </header>
            )}

            <div className="profile-view__scroll">
                {/* ── Hero ── */}
                <div className="profile-view__hero">
                    {profile.avatar_url ? (
                        <img
                            className="profile-view__avatar"
                            src={profile.avatar_url}
                            alt={profile.full_name}
                        />
                    ) : (
                        <div className="profile-view__avatar-fallback">
                            {initial}
                        </div>
                    )}
                    <h1 className="profile-view__name">{profile.full_name || 'Sin nombre'}</h1>
                    {profile.headline && (
                        <p className="profile-view__headline">{profile.headline}</p>
                    )}
                    {(profile.city || profile.country) && (
                        <p className="profile-view__location">
                            <span className="material-symbols-rounded">location_on</span>
                            {[profile.city, profile.country].filter(Boolean).join(', ')}
                        </p>
                    )}

                    {/* CTA buttons */}
                    <div className="profile-view__hero-actions">
                        <button className="profile-view__btn profile-view__btn--primary" onClick={openEdit}>
                            <span className="material-symbols-rounded">edit</span>
                            Editar perfil
                        </button>
                        <button
                            className="profile-view__btn profile-view__btn--outline"
                            onClick={() => navigate('/app/cv')}
                        >
                            <span className="material-symbols-rounded">description</span>
                            Ver mi CV
                        </button>
                    </div>
                </div>

                {/* ── Datos rápidos ── */}
                <div className="profile-view__quick-info">
                    {profile.salary_expectation && (
                        <div className="profile-view__quick-item">
                            <span className="material-symbols-rounded">payments</span>
                            <div>
                                <p className="profile-view__quick-label">Pretensión salarial</p>
                                <p className="profile-view__quick-value">
                                    USD {Number(profile.salary_expectation).toLocaleString()}/mes
                                </p>
                            </div>
                        </div>
                    )}
                    {profile.work_modality && (
                        <div className="profile-view__quick-item">
                            <span className="material-symbols-rounded">work</span>
                            <div>
                                <p className="profile-view__quick-label">Modalidad</p>
                                <p className="profile-view__quick-value">
                                    {MODALITY_LABELS[profile.work_modality] || profile.work_modality}
                                </p>
                            </div>
                        </div>
                    )}
                    {profile.availability && (
                        <div className="profile-view__quick-item">
                            <span className="material-symbols-rounded">schedule</span>
                            <div>
                                <p className="profile-view__quick-label">Disponibilidad</p>
                                <p className="profile-view__quick-value">
                                    {AVAILABILITY_LABELS[profile.availability] || profile.availability}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Habilidades ── */}
                {skills.length > 0 && (
                    <section className="profile-view__section">
                        <h3 className="profile-view__section-title">Habilidades</h3>
                        <div className="profile-view__chips">
                            {skills.map((s, i) => (
                                <span key={i} className="profile-view__chip">
                                    {typeof s === 'string' ? s : s.name || s}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Idiomas ── */}
                {languages.length > 0 && (
                    <section className="profile-view__section">
                        <h3 className="profile-view__section-title">Idiomas</h3>
                        <div className="profile-view__chips">
                            {languages.map((l, i) => (
                                <span key={i} className="profile-view__chip">
                                    {l.name} · {l.level}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Experiencia ── */}
                {experience.length > 0 && (
                    <section className="profile-view__section">
                        <h3 className="profile-view__section-title">Experiencia</h3>
                        <div className="profile-view__timeline">
                            {experience.map((e, i) => (
                                <div key={i} className="profile-view__timeline-item">
                                    <div className="profile-view__timeline-dot" />
                                    <div className="profile-view__timeline-body">
                                        <p className="profile-view__timeline-title">{e.position}</p>
                                        <p className="profile-view__timeline-sub">{e.company}</p>
                                        {(e.start || e.end) && (
                                            <p className="profile-view__timeline-date">
                                                {e.start}{e.end ? ` — ${e.end}` : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Educación ── */}
                {education.length > 0 && (
                    <section className="profile-view__section">
                        <h3 className="profile-view__section-title">Educación</h3>
                        <div className="profile-view__timeline">
                            {education.map((e, i) => (
                                <div key={i} className="profile-view__timeline-item">
                                    <div className="profile-view__timeline-dot" />
                                    <div className="profile-view__timeline-body">
                                        <p className="profile-view__timeline-title">{e.degree}</p>
                                        <p className="profile-view__timeline-sub">{e.institution}</p>
                                        {e.year && (
                                            <p className="profile-view__timeline-date">{e.year}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Intereses ── */}
                {interests.length > 0 && (
                    <section className="profile-view__section">
                        <h3 className="profile-view__section-title">Intereses</h3>
                        <div className="profile-view__chips">
                            {interests.map((t, i) => (
                                <span key={i} className="profile-view__chip profile-view__chip--muted">
                                    {typeof t === 'string' ? t : t.name || t}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Cerrar sesión (bottom) ── */}
                <button className="profile-view__signout-btn" onClick={handleSignOut}>
                    <span className="material-symbols-rounded">logout</span>
                    Cerrar sesión
                </button>
            </div>

            {/* ═══════ MODAL DE EDICIÓN ═══════ */}
            {showEdit && (
                <div className="profile-edit-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) setShowEdit(false);
                }}>
                    <div className="profile-edit-modal">
                        <div className="profile-edit-modal__header">
                            <h3 className="profile-edit-modal__title">Editar perfil</h3>
                            <button
                                className="profile-edit-modal__close"
                                onClick={() => setShowEdit(false)}
                                aria-label="Cerrar"
                            >
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>

                        <div className="profile-edit-modal__body">
                            <div className="profile-edit-field">
                                <label className="profile-edit-label">Nombre completo</label>
                                <input
                                    className="profile-edit-input"
                                    type="text"
                                    value={editData.full_name}
                                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                    placeholder="Tu nombre completo"
                                />
                            </div>

                            <div className="profile-edit-field">
                                <label className="profile-edit-label">Cargo / Título profesional</label>
                                <input
                                    className="profile-edit-input"
                                    type="text"
                                    value={editData.headline}
                                    onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                                    placeholder="Ej: Frontend Developer"
                                />
                            </div>

                            <div className="profile-edit-field">
                                <label className="profile-edit-label">Ciudad</label>
                                <input
                                    className="profile-edit-input"
                                    type="text"
                                    value={editData.city}
                                    onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                                    placeholder="Ej: Santiago"
                                />
                            </div>

                            <div className="profile-edit-field">
                                <label className="profile-edit-label">Pretensión salarial (USD/mes)</label>
                                <input
                                    className="profile-edit-input"
                                    type="number"
                                    value={editData.salary_expectation}
                                    onChange={(e) => setEditData({ ...editData, salary_expectation: e.target.value })}
                                    placeholder="Ej: 3000"
                                />
                            </div>

                            <div className="profile-edit-field">
                                <label className="profile-edit-label">Modalidad preferida</label>
                                <select
                                    className="profile-edit-select"
                                    value={editData.work_modality}
                                    onChange={(e) => setEditData({ ...editData, work_modality: e.target.value })}
                                >
                                    <option value="">Selecciona una modalidad</option>
                                    <option value="Remoto">Remoto</option>
                                    <option value="Híbrido">Híbrido</option>
                                    <option value="Presencial">Presencial</option>
                                </select>
                            </div>
                        </div>

                        <div className="profile-edit-modal__footer">
                            <button
                                className="profile-edit-modal__cancel"
                                onClick={() => setShowEdit(false)}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                className="profile-edit-modal__save"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Guardando…' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
