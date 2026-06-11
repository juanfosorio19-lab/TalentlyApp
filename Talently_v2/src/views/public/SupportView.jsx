// src/views/public/SupportView.jsx
// Formulario de soporte — accesible desde Settings (candidato y empresa)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { logError } from '../../lib/errorLogger';
import './SupportView.css';

const CATEGORIES = [
    { id: 'technical',  label: 'Problema técnico',  icon: 'build' },
    { id: 'account',    label: 'Mi cuenta',          icon: 'manage_accounts' },
    { id: 'matches',    label: 'Matches / Chat',     icon: 'favorite' },
    { id: 'billing',    label: 'Facturación',        icon: 'receipt_long' },
    { id: 'suggestion', label: 'Sugerencia',         icon: 'lightbulb' },
    { id: 'other',      label: 'Otro',               icon: 'more_horiz' },
];

export default function SupportView() {
    const navigate  = useNavigate();
    const { state } = useApp();
    const { currentUser } = state;
    const { user } = useAuth();

    // Email de la sesión (AuthContext es la fuente confiable; AppContext puede
    // estar vacío en cold start). La ruta es pública: sin sesión, se pide.
    const sessionEmail = user?.email || currentUser?.email || '';

    const [category,    setCategory]    = useState('');
    const [email,       setEmail]       = useState(sessionEmail);
    const [subject,     setSubject]     = useState('');
    const [description, setDescription] = useState('');
    const [loading,     setLoading]     = useState(false);
    const [sent,        setSent]        = useState(false);
    const [errors,      setErrors]      = useState({});

    // ── Validar campos ──
    const validate = () => {
        const e = {};
        const finalEmail = (sessionEmail || email).trim();
        if (!finalEmail || !/\S+@\S+\.\S+/.test(finalEmail)) e.email = 'Ingresa un correo válido para responderte';
        if (!subject.trim())     e.subject     = 'El asunto es obligatorio';
        if (!description.trim()) e.description = 'La descripción es obligatoria';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Enviar ticket ──
    const handleSend = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            // support_tickets no tiene columna category: va como prefijo del mensaje.
            const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label;
            const { error } = await db.support.createTicket({
                user_id: user?.id || currentUser?.id || null,
                email:   (sessionEmail || email).trim(),
                subject: subject.trim(),
                message: categoryLabel
                    ? `[${categoryLabel}] ${description.trim()}`
                    : description.trim(),
                status:  'open',
            });

            // ⚠️ supabase-js no lanza: devuelve { error }. Solo mostramos éxito
            // si el ticket REALMENTE se creó (antes se mostraba éxito siempre).
            if (error) {
                logError('SUPPORT', `createTicket:error ${error.message || error}`, null,
                    { overlay: false, userEmail: (sessionEmail || email).trim() });
                setErrors((p) => ({ ...p, form: 'No se pudo enviar el mensaje. Intenta de nuevo o escríbenos a soporte@talently.app.' }));
                return;
            }
            setSent(true);
        } catch (err) {
            logError('SUPPORT', `createTicket:throw ${err?.message || err}`, null, { overlay: false });
            setErrors((p) => ({ ...p, form: 'No se pudo enviar el mensaje. Intenta de nuevo o escríbenos a soporte@talently.app.' }));
        } finally {
            setLoading(false);
        }
    };

    // ── Éxito ──
    if (sent) {
        return (
            <div className="supp">
                <header className="supp__header">
                    <button
                        className="supp__back"
                        onClick={() => navigate(-1)}
                        aria-label="Volver"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <h1 className="supp__title">Soporte</h1>
                    <div className="supp__spacer" />
                </header>

                <div className="supp__success">
                    <div className="supp__success-icon-wrap">
                        <span className="material-symbols-rounded supp__success-icon">check_circle</span>
                    </div>
                    <h2 className="supp__success-title">Mensaje enviado</h2>
                    <p className="supp__success-sub">
                        Hemos recibido tu mensaje. Te responderemos a{' '}
                        <strong>{(sessionEmail || email).trim() || 'tu correo'}</strong> en menos de 48 horas.
                    </p>
                    <button className="supp__success-btn" onClick={() => navigate(-1)}>
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="supp">
            {/* ── Header ── */}
            <header className="supp__header">
                <button
                    className="supp__back"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h1 className="supp__title">Soporte</h1>
                <div className="supp__spacer" />
            </header>

            {/* ── Scroll ── */}
            <div className="supp__scroll">

                {/* ── Intro ── */}
                <div className="supp__intro">
                    <p className="supp__intro-text">
                        Cuéntanos qué ocurrió y te ayudaremos lo antes posible.
                    </p>
                </div>

                {/* ── Email (read-only con sesión; editable si es anónimo) ── */}
                <div className="supp__field">
                    <label className="supp__label" htmlFor="supp-email">
                        Correo electrónico {!sessionEmail && <span className="supp__required">*</span>}
                    </label>
                    <div className={`supp__input-wrap ${sessionEmail ? 'supp__input-wrap--readonly' : ''}`}>
                        <span className="material-symbols-rounded supp__input-icon">mail</span>
                        <input
                            id="supp-email"
                            name="email"
                            className={`supp__input ${sessionEmail ? 'supp__input--readonly' : ''} ${errors.email ? 'supp__input--error' : ''}`}
                            type="email"
                            placeholder="tu@correo.com"
                            value={sessionEmail || email}
                            readOnly={!!sessionEmail}
                            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                        />
                    </div>
                    {errors.email && <p className="supp__error">{errors.email}</p>}
                </div>

                {/* ── Categoría ── */}
                <div className="supp__field">
                    <label className="supp__label">Categoría</label>
                    <div className="supp__chips">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                className={`supp__chip ${category === cat.id ? 'supp__chip--active' : ''}`}
                                onClick={() => setCategory(cat.id)}
                            >
                                <span className="material-symbols-rounded supp__chip-icon">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Asunto ── */}
                <div className="supp__field">
                    <label className="supp__label" htmlFor="supp-subject">
                        Asunto <span className="supp__required">*</span>
                    </label>
                    <input
                        id="supp-subject"
                        name="subject"
                        className={`supp__input ${errors.subject ? 'supp__input--error' : ''}`}
                        type="text"
                        placeholder="Ej: No puedo iniciar sesión"
                        value={subject}
                        onChange={(e) => { setSubject(e.target.value); setErrors((p) => ({ ...p, subject: '' })); }}
                        maxLength={120}
                    />
                    {errors.subject && <p className="supp__error">{errors.subject}</p>}
                </div>

                {/* ── Descripción ── */}
                <div className="supp__field">
                    <label className="supp__label" htmlFor="supp-description">
                        Descripción <span className="supp__required">*</span>
                    </label>
                    <textarea
                        id="supp-description"
                        name="description"
                        className={`supp__textarea ${errors.description ? 'supp__input--error' : ''}`}
                        placeholder="Describe el problema con el mayor detalle posible…"
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
                        rows={5}
                        maxLength={2000}
                    />
                    <p className="supp__char-count">{description.length} / 2000</p>
                    {errors.description && <p className="supp__error">{errors.description}</p>}
                </div>

                {/* ── Error de envío (el ticket NO se creó) ── */}
                {errors.form && <p className="supp__error">{errors.form}</p>}

                {/* ── Enviar ── */}
                <button
                    className={`supp__send-btn ${loading ? 'supp__send-btn--loading' : ''}`}
                    onClick={handleSend}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="supp__spinner" />
                    ) : (
                        <>
                            <span className="material-symbols-rounded">send</span>
                            Enviar mensaje
                        </>
                    )}
                </button>

                {/* ── Footer de recursos ── */}
                <div className="supp__resources">
                    <p className="supp__resources-label">¿Prefieres otra vía?</p>
                    <div className="supp__resources-row">
                        <a href="mailto:soporte@talently.app" className="supp__resource-btn">
                            <span className="material-symbols-rounded">mail</span>
                            Email directo
                        </a>
                        <button className="supp__resource-btn" onClick={() => navigate('/faq')}>
                            <span className="material-symbols-rounded">help_outline</span>
                            Ver FAQs
                        </button>
                    </div>
                </div>

                <div className="supp__bottom-gap" />
            </div>
        </div>
    );
}
