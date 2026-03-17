// src/components/swipe/SwipeCard.jsx
// Tarjeta visual para el stack de swipe — diseño Stitch
import './SwipeCard.css';

const MAX_VISIBLE_SKILLS = 4;

export default function SwipeCard({ profile, style, swipeDirection, isFront }) {
    if (!profile) return null;

    const {
        avatar_url,
        company_name,
        full_name,
        company_sector,
        position,
        city,
        country,
        location,
        work_modality,
        salary_min,
        salary_max,
        company_description,
        bio,
        skills,
        company_tech_stack,
        match_score,
    } = profile;

    const displayName     = company_name || full_name || 'Sin nombre';
    const displaySector   = company_sector || position || '';
    const displayLocation = location || [city, country].filter(Boolean).join(', ');
    const description     = company_description || bio || '';

    // Habilidades: preferir skills, fallback a tech_stack
    const rawSkills = Array.isArray(skills) && skills.length > 0
        ? skills
        : Array.isArray(company_tech_stack) ? company_tech_stack : [];
    const skillList  = rawSkills.slice(0, MAX_VISIBLE_SKILLS);
    const extraCount = rawSkills.length - skillList.length;

    // Iniciales para el placeholder de logo
    const initials = displayName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div
            className={`swipe-card ${!isFront ? 'is-behind' : ''}`}
            style={style}
        >
            {/* ── Gradiente superior sutil ── */}
            <div className="swipe-card__top-gradient" />

            {/* ── Header: logo + match badge ── */}
            <div className="swipe-card__header">
                {/* Logo de empresa */}
                <div className="swipe-card__logo">
                    {avatar_url ? (
                        <img
                            src={avatar_url}
                            alt={displayName}
                            className="swipe-card__logo-img"
                            draggable={false}
                        />
                    ) : (
                        <span className="swipe-card__logo-initials">{initials}</span>
                    )}
                </div>

                {/* Badge de match (si existe) */}
                {match_score != null && (
                    <span className="swipe-card__match-badge">
                        {match_score}% Match
                    </span>
                )}
            </div>

            {/* ── Cuerpo principal ── */}
            <div className="swipe-card__body">
                <h2 className="swipe-card__name">{displayName}</h2>
                {displaySector && (
                    <p className="swipe-card__sector">{displaySector}</p>
                )}

                {/* Chips: ubicación + modalidad + salario */}
                <div className="swipe-card__chips">
                    {displayLocation && (
                        <span className="swipe-card__chip">
                            <span className="material-symbols-rounded">location_on</span>
                            {displayLocation}
                        </span>
                    )}
                    {work_modality && (
                        <span className="swipe-card__chip">
                            <span className="material-symbols-rounded">work_outline</span>
                            {work_modality}
                        </span>
                    )}
                    {(salary_min != null || salary_max != null) && (
                        <span className="swipe-card__chip swipe-card__chip--salary">
                            <span className="material-symbols-rounded">attach_money</span>
                            {salary_min != null && salary_max != null
                                ? `$${salary_min}k – $${salary_max}k`
                                : salary_min != null
                                    ? `Desde $${salary_min}k`
                                    : `Hasta $${salary_max}k`}
                        </span>
                    )}
                </div>

                {/* Descripción */}
                {description && (
                    <p className="swipe-card__description">{description}</p>
                )}

                {/* Habilidades / Tech stack */}
                {skillList.length > 0 && (
                    <div className="swipe-card__skills">
                        {skillList.map((skill) => (
                            <span key={skill.id || skill.name || skill} className="swipe-card__skill-tag">
                                {typeof skill === 'string' ? skill : skill.name || skill}
                            </span>
                        ))}
                        {extraCount > 0 && (
                            <span className="swipe-card__skill-tag swipe-card__skill-tag--more">
                                +{extraCount} más
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Stamps LIKE / NOPE ── */}
            {isFront && (
                <>
                    <div className={`swipe-card__stamp swipe-card__stamp--like ${swipeDirection === 'right' ? 'is-visible' : ''}`}>
                        LIKE
                    </div>
                    <div className={`swipe-card__stamp swipe-card__stamp--nope ${swipeDirection === 'left' ? 'is-visible' : ''}`}>
                        NOPE
                    </div>
                </>
            )}
        </div>
    );
}
