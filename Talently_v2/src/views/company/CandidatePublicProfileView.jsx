// src/views/company/CandidatePublicProfileView.jsx
// Vista de perfil público de candidato — accesible desde el swipe de empresa
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import {
    AVAILABILITY_LABELS,
    AVAILABILITY_IS_OPEN,
    WORK_MODALITY_LABELS,
} from '../../data/constants';
import { Spinner, SectionCard } from '../../components/ui';
import './CandidatePublicProfileView.css';

// ── Helpers ──────────────────────────────────
function getAge(birthDate) {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function formatSalary(min, max) {
    if (min != null && max != null) return `$${min}k – $${max}k`;
    if (min != null) return `Desde $${min}k`;
    if (max != null) return `Hasta $${max}k`;
    return null;
}

function getInitials(name = '') {
    return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
}

function TimelineItem({ logo, initials, title, subtitle, period, description }) {
    return (
        <div className="cpp-timeline-item">
            <div className="cpp-timeline-avatar">
                {logo
                    ? <img src={logo} alt={subtitle} className="cpp-timeline-avatar-img" />
                    : <span className="cpp-timeline-avatar-initials">{initials}</span>
                }
            </div>
            <div className="cpp-timeline-body">
                <h3 className="cpp-timeline-title">{title}</h3>
                <p className="cpp-timeline-subtitle">{subtitle}</p>
                {period && <p className="cpp-timeline-period">{period}</p>}
                {description && <p className="cpp-timeline-desc">{description}</p>}
            </div>
        </div>
    );
}

// ── Vista principal ───────────────────────────
export default function CandidatePublicProfileView() {
    const { profileId } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [swipeLoading, setSwipeLoading] = useState(false);

    // ── Cargar perfil ──
    useEffect(() => {
        if (!profileId) return;
        const load = async () => {
            setLoading(true);
            setError(null);
            const { data, error: err } = await db.profiles.getPublicById(profileId);
            if (err || !data) {
                setError('No se pudo cargar el perfil.');
            } else {
                setProfile(data);
            }
            setLoading(false);
        };
        load();
    }, [profileId]);

    // ── Swipe desde la vista de perfil ──
    const handleSwipe = useCallback(async (direction) => {
        if (swipeLoading || !profileId) return;
        setSwipeLoading(true);
        try {
            await db.swipes.create(profileId, direction);
            await db.statistics.increment('swipes_given');
        } catch (e) {
            console.error('[CandidatePublicProfileView] Swipe error:', e);
        } finally {
            setSwipeLoading(false);
            navigate(-1);
        }
    }, [profileId, swipeLoading, navigate]);

    // ── Loading ──
    if (loading) {
        return (
            <div className="cpp-center">
                <Spinner />
                <p className="cpp-loading-text">Cargando perfil...</p>
            </div>
        );
    }

    // ── Error ──
    if (error || !profile) {
        return (
            <div className="cpp-center">
                <span className="material-symbols-outlined cpp-error-icon">error_outline</span>
                <p className="cpp-error-text">{error || 'Perfil no encontrado.'}</p>
                <button className="cpp-back-btn-plain" onClick={() => navigate(-1)}>
                    Volver
                </button>
            </div>
        );
    }

    // ── Datos del perfil ──
    const {
        full_name,
        avatar_url,
        birth_date,
        position,
        current_title,
        city,
        country,
        open_to_relocation,
        availability,
        bio,
        skills,
        experience,
        education,
        expected_salary_min,
        salary_min,
        expected_salary_max,
        salary_max,
        work_modality,
        preferred_modality,
        cv_url,
    } = profile;

    const name    = full_name || 'Candidato';
    const age     = getAge(birth_date);
    const title   = current_title || position || '';
    const location = [city, country].filter(Boolean).join(', ');
    const openToReloc = open_to_relocation ?? false;

    const availLabel = AVAILABILITY_LABELS[availability] || availability || null;
    const isOpen     = AVAILABILITY_IS_OPEN(availability);

    const modality     = work_modality || preferred_modality || '';
    const modalityLabel = WORK_MODALITY_LABELS[modality?.toLowerCase?.()] || modality || null;

    const salaryText = formatSalary(
        expected_salary_min ?? salary_min,
        expected_salary_max ?? salary_max
    );

    const skillList = Array.isArray(skills) ? skills : [];
    const expList   = Array.isArray(experience) ? experience : [];
    const eduList   = Array.isArray(education) ? education : [];

    return (
        <div className="cpp-wrapper">
            {/* ── Botón cerrar / volver ── */}
            <button
                className="cpp-close-btn"
                onClick={() => navigate(-1)}
                aria-label="Cerrar"
            >
                <span className="material-symbols-outlined">close</span>
            </button>

            {/* ── Scroll principal ── */}
            <div className="cpp-scroll">

                {/* ── Hero: foto + datos básicos ── */}
                <div className="cpp-hero">
                    <div
                        className="cpp-hero-bg"
                        style={avatar_url ? { backgroundImage: `url(${avatar_url})` } : {}}
                    >
                        {!avatar_url && (
                            <div className="cpp-hero-initials-fallback">
                                <span>{getInitials(name)}</span>
                            </div>
                        )}
                    </div>
                    <div className="cpp-hero-overlay" />

                    <div className="cpp-hero-content">
                        {/* Badges de estado */}
                        <div className="cpp-hero-badges">
                            {availLabel && (
                                <span className={`cpp-badge ${isOpen ? 'cpp-badge--primary' : 'cpp-badge--neutral'}`}>
                                    {availLabel}
                                </span>
                            )}
                            <span className="cpp-badge cpp-badge--verified">
                                <span className="material-symbols-outlined cpp-badge-icon">verified</span>
                                Verificado
                            </span>
                        </div>

                        <h1 className="cpp-hero-name">
                            {name}{age ? `, ${age}` : ''}
                        </h1>
                        {title && <p className="cpp-hero-title">{title}</p>}
                        {location && (
                            <div className="cpp-hero-location">
                                <span className="material-symbols-outlined cpp-location-icon">location_on</span>
                                <span>
                                    {location}
                                    {openToReloc && ' (Abierto a reubicación)'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Contenido de secciones ── */}
                <div className="cpp-body">

                    {/* Sobre mí */}
                    {bio && (
                        <SectionCard icon="person" title="Sobre mí">
                            <p className="cpp-bio">{bio}</p>
                        </SectionCard>
                    )}

                    {/* Ver CV */}
                    {cv_url && (
                        <div className="cpp-cv-row">
                            <button
                                className="cpp-cv-btn"
                                onClick={() => window.open(cv_url, '_blank')}
                            >
                                <span className="material-symbols-outlined">description</span>
                                Ver CV
                            </button>
                        </div>
                    )}

                    {/* Habilidades */}
                    {skillList.length > 0 && (
                        <SectionCard icon="psychology" title="Habilidades">
                            <div className="cpp-skills">
                                {skillList.map((skill, i) => (
                                    <span key={i} className="cpp-skill-tag">
                                        {typeof skill === 'string' ? skill : skill?.name || skill}
                                    </span>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Experiencia */}
                    {expList.length > 0 && (
                        <SectionCard icon="work" title="Experiencia Laboral">
                            <div className="cpp-timeline">
                                {expList.map((exp, i) => (
                                    <TimelineItem
                                        key={i}
                                        logo={exp.company_logo}
                                        initials={getInitials(exp.company || exp.company_name || '?')}
                                        title={exp.title || exp.position || ''}
                                        subtitle={exp.company || exp.company_name || ''}
                                        period={[exp.start_date, exp.end_date || 'Presente'].filter(Boolean).join(' – ')}
                                        description={exp.description}
                                    />
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Educación */}
                    {eduList.length > 0 && (
                        <SectionCard icon="school" title="Educación">
                            <div className="cpp-timeline">
                                {eduList.map((edu, i) => (
                                    <TimelineItem
                                        key={i}
                                        initials={getInitials(edu.institution || edu.school || '?').slice(0, 3)}
                                        title={edu.degree || edu.title || ''}
                                        subtitle={edu.institution || edu.school || ''}
                                        period={[edu.start_year, edu.end_year].filter(Boolean).join(' – ')}
                                    />
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Preferencias */}
                    {(salaryText || modalityLabel) && (
                        <SectionCard icon="tune" title="Preferencias">
                            <div className="cpp-prefs-grid">
                                {salaryText && (
                                    <div className="cpp-pref-card">
                                        <div className="cpp-pref-icon cpp-pref-icon--green">
                                            <span className="material-symbols-outlined">attach_money</span>
                                        </div>
                                        <span className="cpp-pref-label">Salario Esperado</span>
                                        <p className="cpp-pref-value">{salaryText}</p>
                                        <span className="cpp-pref-sub">USD / Mensual</span>
                                    </div>
                                )}
                                {modalityLabel && (
                                    <div className="cpp-pref-card">
                                        <div className="cpp-pref-icon cpp-pref-icon--purple">
                                            <span className="material-symbols-outlined">cottage</span>
                                        </div>
                                        <span className="cpp-pref-label">Modalidad</span>
                                        <p className="cpp-pref-value">{modalityLabel}</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    )}

                </div>
            </div>

            {/* ── Gradiente inferior ── */}
            <div className="cpp-fade-bottom" />

            {/* ── Botones de acción fijos ── */}
            <div className="cpp-actions">
                <button
                    className="cpp-action-btn cpp-action-btn--nope"
                    onClick={() => handleSwipe('left')}
                    disabled={swipeLoading}
                    aria-label="No me interesa"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <button
                    className="cpp-action-btn cpp-action-btn--like"
                    onClick={() => handleSwipe('right')}
                    disabled={swipeLoading}
                    aria-label="Me interesa"
                >
                    <span className="material-symbols-outlined">favorite</span>
                </button>
            </div>
        </div>
    );
}
