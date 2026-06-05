// src/views/candidate/ProfileView.jsx
// Perfil del candidato — diseño Stitch
// isTab=true → sin header propio, height:100% (para embeber en MainApp)
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '../../lib/supabase';
import { logError } from '../../lib/errorLogger';
import { useApp, Actions } from '../../context/AppContext';
import { MODALITY_LABELS, AVAILABILITY_LABELS, AVAILABILITY_OPTIONS } from '../../lib/constants';
import { Spinner } from '../../components/ui';
import './ProfileView.css';

// Formatea un número con separador de miles (3000000 → "3.000.000").
const fmtThousands = (val) => {
    const digits = String(val ?? '').replace(/\D/g, '');
    return digits ? Number(digits).toLocaleString('es-CL') : '';
};
// Extrae solo los dígitos (para guardar el número limpio).
const onlyDigits = (str) => String(str ?? '').replace(/\D/g, '');

export default function ProfileView({ isTab = false }) {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const { userProfile, currentUser } = state;

    const [loading, setLoading] = useState(!userProfile);
    const [showEdit, setShowEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({});
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const avatarInputRef = useRef(null);

    // ── Cargar perfil si no está en AppContext ──
    useEffect(() => {
        if (userProfile || !currentUser) return;
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await db.profiles.getById(currentUser.id);
                if (data) dispatch({ type: Actions.SET_PROFILE, payload: data });
            } catch (err) {
                console.error('[ProfileView]', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [currentUser, userProfile, dispatch]);

    const openEdit = () => {
        setEditData({
            full_name:          userProfile?.full_name || '',
            headline:           userProfile?.headline || '',
            bio:                userProfile?.bio || userProfile?.about || '',
            city:               userProfile?.city || '',
            salary_expectation: userProfile?.salary_expectation || '',
            work_modality:      userProfile?.work_modality || '',
            availability:       userProfile?.availability || '',
        });
        setShowEdit(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // salary_expectation puede venir como string formateado → limpiar a número
            const payload = {
                ...userProfile,
                ...editData,
                salary_expectation: editData.salary_expectation
                    ? Number(onlyDigits(editData.salary_expectation))
                    : null,
            };
            const { data: updated, error } = await db.profiles.create(payload);
            if (error) {
                logError('PROFILE_SAVE', error.message, { code: error.code, details: error.details });
                return;
            }
            if (updated) dispatch({ type: Actions.SET_PROFILE, payload: updated });
            setShowEdit(false);
        } catch (err) {
            logError('PROFILE_SAVE_THROW', err?.message || String(err), { stack: err?.stack });
        } finally {
            setSaving(false);
        }
    };

    // ── Cambiar foto de perfil ──
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const publicUrl = await db.storage.uploadImage(file, 'avatars');
            if (!publicUrl) {
                logError('AVATAR_UPLOAD', 'uploadImage devolvió null (tipo/tamaño o storage)');
                return;
            }
            const { data: updated, error } = await db.profiles.create({
                ...userProfile, avatar_url: publicUrl,
            });
            if (error) {
                logError('AVATAR_SAVE', error.message, { code: error.code });
                return;
            }
            if (updated) dispatch({ type: Actions.SET_PROFILE, payload: updated });
        } catch (err) {
            logError('AVATAR_THROW', err?.message || String(err), { stack: err?.stack });
        } finally {
            setUploadingAvatar(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        dispatch({ type: Actions.LOGOUT });
        navigate('/', { replace: true });
    };

    if (loading) {
        return (
            <div className={`pv ${isTab ? 'pv--tab' : ''} pv--loading`}>
                <Spinner />
            </div>
        );
    }

    const p          = userProfile || {};
    const initial    = (p.full_name || '?')[0].toUpperCase();
    const location   = [p.city, p.country].filter(Boolean).join(', ');
    const skills     = Array.isArray(p.skills)     ? p.skills     : [];
    const languages  = Array.isArray(p.languages)  ? p.languages  : [];
    const experience = Array.isArray(p.experience) ? p.experience : [];
    const education  = Array.isArray(p.education)  ? p.education  : [];
    const interests  = Array.isArray(p.interests)  ? p.interests  : [];
    const bio        = p.bio || p.about || '';

    return (
        <div className={`pv ${isTab ? 'pv--tab' : ''}`}>
            {/* ── Sticky header ── */}
            <div className="pv__header">
                <h1 className="pv__header-title">Mi Perfil</h1>
                <button className="pv__header-edit" onClick={openEdit} aria-label="Editar perfil">
                    <span className="material-symbols-rounded">edit</span>
                </button>
            </div>

            {/* ── Scroll ── */}
            <div className="pv__scroll">

                {/* Hero */}
                <div className="pv__hero">
                    <div className="pv__avatar-wrap">
                        {p.avatar_url ? (
                            <img src={p.avatar_url} alt={p.full_name} className="pv__avatar" />
                        ) : (
                            <div className="pv__avatar-fallback">{initial}</div>
                        )}
                        {/* Botón cambiar foto */}
                        <button
                            type="button"
                            className="pv__avatar-edit"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            aria-label="Cambiar foto de perfil"
                        >
                            <span className="material-symbols-rounded">
                                {uploadingAvatar ? 'hourglass_top' : 'photo_camera'}
                            </span>
                        </button>
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <h2 className="pv__name">{p.full_name || 'Sin nombre'}</h2>
                    {p.headline && <p className="pv__headline">{p.headline}</p>}
                    {location && (
                        <p className="pv__location">
                            <span className="material-symbols-rounded">location_on</span>
                            {location}
                        </p>
                    )}

                    {/* Detail chips */}
                    {(p.salary_expectation || p.work_modality || p.availability) && (
                        <div className="pv__detail-chips">
                            {p.salary_expectation && (
                                <div className="pv__detail-chip">
                                    <span className="material-symbols-rounded">payments</span>
                                    <span>USD {Number(p.salary_expectation).toLocaleString()}/mes</span>
                                </div>
                            )}
                            {p.work_modality && (
                                <div className="pv__detail-chip">
                                    <span className="material-symbols-rounded">laptop_mac</span>
                                    <span>{MODALITY_LABELS[p.work_modality] || p.work_modality}</span>
                                </div>
                            )}
                            {p.availability && (
                                <div className="pv__detail-chip">
                                    <span className="material-symbols-rounded">event_available</span>
                                    <span>{AVAILABILITY_LABELS[p.availability] || p.availability}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Secciones ── */}
                <div className="pv__sections">

                    {/* Sobre mí */}
                    {bio && (
                        <div className="pv__card">
                            <div className="pv__card-header">
                                <h3 className="pv__card-title">Sobre mí</h3>
                                <button className="pv__card-edit" onClick={openEdit} aria-label="Editar">
                                    <span className="material-symbols-rounded">edit</span>
                                </button>
                            </div>
                            <p className="pv__bio">{bio}</p>
                        </div>
                    )}

                    {/* Experiencia */}
                    {experience.length > 0 && (
                        <div className="pv__card">
                            <div className="pv__card-header">
                                <h3 className="pv__card-title">Experiencia</h3>
                                <button className="pv__card-edit" onClick={openEdit} aria-label="Agregar experiencia">
                                    <span className="material-symbols-rounded">add_circle_outline</span>
                                </button>
                            </div>
                            <div className="pv__exp-list">
                                {experience.map((e, i) => (
                                    <div key={i} className="pv__exp-item">
                                        {i > 0 && <div className="pv__divider" />}
                                        <div className="pv__exp-row">
                                            <div className="pv__exp-logo">
                                                {(e.company || '?')[0].toUpperCase()}
                                            </div>
                                            <div className="pv__exp-body">
                                                <p className="pv__exp-title">{e.position}</p>
                                                <p className="pv__exp-company">{e.company}</p>
                                                {(e.start || e.end) && (
                                                    <p className="pv__exp-date">
                                                        {e.start}{e.end ? ` — ${e.end}` : ' — Presente'}
                                                    </p>
                                                )}
                                                {e.description && (
                                                    <p className="pv__exp-desc">{e.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Educación */}
                    {education.length > 0 && (
                        <div className="pv__card">
                            <div className="pv__card-header">
                                <h3 className="pv__card-title">Educación</h3>
                                <button className="pv__card-edit" onClick={openEdit} aria-label="Agregar educación">
                                    <span className="material-symbols-rounded">add_circle_outline</span>
                                </button>
                            </div>
                            <div className="pv__exp-list">
                                {education.map((e, i) => (
                                    <div key={i} className="pv__exp-item">
                                        {i > 0 && <div className="pv__divider" />}
                                        <div className="pv__exp-row">
                                            <div className="pv__exp-logo pv__exp-logo--edu">
                                                <span className="material-symbols-rounded">school</span>
                                            </div>
                                            <div className="pv__exp-body">
                                                <p className="pv__exp-title">{e.degree}</p>
                                                <p className="pv__exp-company">{e.institution}</p>
                                                {e.year && <p className="pv__exp-date">{e.year}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Habilidades */}
                    {skills.length > 0 && (
                        <div className="pv__card">
                            <div className="pv__card-header">
                                <h3 className="pv__card-title">Habilidades</h3>
                                <button className="pv__card-edit" onClick={openEdit} aria-label="Editar">
                                    <span className="material-symbols-rounded">edit</span>
                                </button>
                            </div>
                            <div className="pv__chips">
                                {skills.map((s, i) => (
                                    <span key={i} className="pv__chip">
                                        {typeof s === 'string' ? s : s.name || s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Idiomas */}
                    {languages.length > 0 && (
                        <div className="pv__card">
                            <div className="pv__card-header">
                                <h3 className="pv__card-title">Idiomas</h3>
                                <button className="pv__card-edit" onClick={openEdit} aria-label="Editar">
                                    <span className="material-symbols-rounded">edit</span>
                                </button>
                            </div>
                            <div className="pv__lang-list">
                                {languages.map((l, i) => (
                                    <div key={i} className="pv__lang-row">
                                        <span className="pv__lang-name">{l.name}</span>
                                        <span className="pv__lang-badge">{l.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Intereses */}
                    {interests.length > 0 && (
                        <div className="pv__card">
                            <div className="pv__card-header">
                                <h3 className="pv__card-title">Intereses</h3>
                                <button className="pv__card-edit" onClick={openEdit} aria-label="Editar">
                                    <span className="material-symbols-rounded">edit</span>
                                </button>
                            </div>
                            <div className="pv__chips">
                                {interests.map((t, i) => (
                                    <span key={i} className="pv__chip pv__chip--muted">
                                        {typeof t === 'string' ? t : t.name || t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Acciones inferiores */}
                    <div className="pv__actions">
                        {p.cv_url && (
                            <button
                                className="pv__action-btn pv__action-btn--cv"
                                onClick={() => navigate('/app/cv')}
                            >
                                <span className="material-symbols-rounded">description</span>
                                Ver mi CV
                            </button>
                        )}
                        <button
                            className="pv__action-btn pv__action-btn--signout"
                            onClick={handleSignOut}
                        >
                            <span className="material-symbols-rounded">logout</span>
                            Cerrar sesión
                        </button>
                    </div>

                </div>
            </div>

            {/* ══════ MODAL DE EDICIÓN ══════ */}
            {showEdit && (
                <div
                    className="pv-edit-overlay"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowEdit(false); }}
                >
                    <div className="pv-edit-modal">
                        <div className="pv-edit-modal__header">
                            <h3 className="pv-edit-modal__title">Editar perfil</h3>
                            <button
                                className="pv-edit-modal__close"
                                onClick={() => setShowEdit(false)}
                                aria-label="Cerrar"
                            >
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>

                        <div className="pv-edit-modal__body">
                            {/* Campos de texto simples */}
                            {[
                                { key: 'full_name', label: 'Nombre completo',            placeholder: 'Tu nombre completo' },
                                { key: 'headline',  label: 'Cargo / Título profesional', placeholder: 'Ej: Frontend Developer' },
                                { key: 'city',      label: 'Ciudad',                     placeholder: 'Ej: Santiago' },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key} className="pv-edit-field">
                                    <label className="pv-edit-label" htmlFor={`pv-edit-${key}`}>{label}</label>
                                    <input
                                        id={`pv-edit-${key}`}
                                        name={key}
                                        className="pv-edit-input"
                                        type="text"
                                        value={editData[key] || ''}
                                        onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                        placeholder={placeholder}
                                    />
                                </div>
                            ))}

                            {/* Sobre mí */}
                            <div className="pv-edit-field">
                                <label className="pv-edit-label" htmlFor="pv-edit-bio">Sobre mí</label>
                                <textarea
                                    id="pv-edit-bio"
                                    name="bio"
                                    className="pv-edit-input"
                                    rows={3}
                                    value={editData.bio || ''}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    placeholder="Cuéntale a las empresas quién eres…"
                                    style={{ resize: 'vertical', minHeight: 72, fontFamily: 'inherit' }}
                                />
                            </div>

                            {/* Pretensión salarial con separador de miles */}
                            <div className="pv-edit-field">
                                <label className="pv-edit-label" htmlFor="pv-edit-salary">Pretensión salarial (USD/mes)</label>
                                <input
                                    id="pv-edit-salary"
                                    name="salary_expectation"
                                    className="pv-edit-input"
                                    type="text"
                                    inputMode="numeric"
                                    value={fmtThousands(editData.salary_expectation)}
                                    onChange={(e) => setEditData({ ...editData, salary_expectation: onlyDigits(e.target.value) })}
                                    placeholder="Ej: 3.000.000"
                                />
                            </div>

                            {/* Modalidad */}
                            <div className="pv-edit-field">
                                <label className="pv-edit-label" htmlFor="pv-edit-work_modality">Modalidad preferida</label>
                                <select
                                    id="pv-edit-work_modality"
                                    name="work_modality"
                                    className="pv-edit-select"
                                    value={editData.work_modality || ''}
                                    onChange={(e) => setEditData({ ...editData, work_modality: e.target.value })}
                                >
                                    <option value="">Selecciona una modalidad</option>
                                    <option value="Remoto">Remoto</option>
                                    <option value="Híbrido">Híbrido</option>
                                    <option value="Presencial">Presencial</option>
                                </select>
                            </div>

                            {/* Disponibilidad */}
                            <div className="pv-edit-field">
                                <label className="pv-edit-label" htmlFor="pv-edit-availability">Disponibilidad</label>
                                <select
                                    id="pv-edit-availability"
                                    name="availability"
                                    className="pv-edit-select"
                                    value={editData.availability || ''}
                                    onChange={(e) => setEditData({ ...editData, availability: e.target.value })}
                                >
                                    <option value="">Selecciona disponibilidad</option>
                                    {AVAILABILITY_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pv-edit-modal__footer">
                            <button
                                className="pv-edit-modal__cancel"
                                onClick={() => setShowEdit(false)}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                className="pv-edit-modal__save"
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
