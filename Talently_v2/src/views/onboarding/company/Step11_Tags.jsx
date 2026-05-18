// Company Step 11 — Tags de empresa (keywords, opcional, máx. 10)
import { useState } from 'react';

const MAX_TAGS = 10;

const SUGGESTED_TAGS = [
    'Fast-paced', 'Data-driven', 'Remote-first', 'Startup', 'Scale-up',
    'Innovación', 'Colaboración', 'SaaS', 'Fintech', 'E-commerce',
    'Agile', 'Diversity', 'Impact', 'AI/ML', 'Green Tech',
    'Open Source', 'Product-led', 'Customer-first', 'Design-thinking', 'EdTech',
];

export default function Step11_Tags({ data, onNext, saving }) {
    const [tags, setTags] = useState(data.company_tags || []);
    const [input, setInput] = useState('');

    const atMax = tags.length >= MAX_TAGS;
    const progress = Math.min((tags.length / MAX_TAGS) * 100, 100);

    const addTag = (raw) => {
        const trimmed = (raw ?? input).trim();
        if (!trimmed || tags.includes(trimmed) || atMax) return;
        setTags((prev) => [...prev, trimmed]);
        setInput('');
    };

    const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

    const toggleSuggested = (tag) => {
        if (tags.includes(tag)) {
            removeTag(tag);
        } else if (!atMax) {
            setTags((prev) => [...prev, tag]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    };

    const handleNext = () => {
        onNext({ company_tags: tags });
    };

    // Sugerencias que NO están seleccionadas aún
    const visibleSuggestions = SUGGESTED_TAGS.filter((t) => !tags.includes(t));

    return (
        <>
            <h2 className="ob-title">
                ¿Cómo describirías tu empresa en palabras clave?{' '}
                <span style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--primary)',
                    background: 'rgba(var(--primary-rgb), 0.1)',
                    padding: '3px 8px', borderRadius: 99,
                    verticalAlign: 'middle', marginLeft: 4,
                }}>
                    Opcional
                </span>
            </h2>
            <p className="ob-subtitle">Los tags ayudan a los candidatos a encontrarte más fácilmente.</p>

            <div className="ob-content">
                {/* ── Sección: sugerencias populares ── */}
                <div className="ob-field">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <label className="ob-label" style={{ marginBottom: 0 }}>Sugerencias populares</label>
                    </div>

                    <div className="ob-chips">
                        {visibleSuggestions.map((tag) => (
                            <button
                                key={tag}
                                className="ob-chip"
                                onClick={() => toggleSuggested(tag)}
                                disabled={atMax}
                                style={atMax ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                            >
                                {tag}
                            </button>
                        ))}
                        {visibleSuggestions.length === 0 && (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                Todas las sugerencias están seleccionadas.
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Tags seleccionados ── */}
                {tags.length > 0 && (
                    <div className="ob-field">
                        <label className="ob-label" style={{ marginBottom: 8 }}>
                            Tags seleccionados
                        </label>
                        <div className="ob-chips">
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    className="ob-chip ob-chip--area ob-chip--selected"
                                    onClick={() => removeTag(tag)}
                                >
                                    {tag}
                                    <span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Input custom ── */}
                <div className="ob-field">
                    <label className="ob-label" style={{ marginBottom: 6 }}>¿Tienes otra palabra clave?</label>
                    <div className="ob-input-wrapper" style={{ paddingRight: 6 }}>
                        <span className="material-symbols-rounded ob-input-icon">tag</span>
                        <input
                            className="ob-input"
                            placeholder="Agregar tag personalizado"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={atMax}
                        />
                        {input.trim() && (
                            <button
                                onClick={() => addTag()}
                                disabled={atMax}
                                style={{
                                    width: 32, height: 32, flexShrink: 0,
                                    borderRadius: 8,
                                    background: atMax ? 'var(--border)' : 'var(--primary)',
                                    color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: 'none', cursor: atMax ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s ease',
                                }}
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>add</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Contador + barra de progreso ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                        <span style={{ color: atMax ? 'var(--danger)' : 'var(--primary)', fontWeight: 700 }}>
                            {tags.length}
                        </span>
                        {' / '}{MAX_TAGS} tags
                        {atMax && (
                            <span style={{ color: 'var(--danger)', marginLeft: 6 }}>— Máximo alcanzado</span>
                        )}
                    </p>
                    <div style={{
                        width: 120, height: 6, borderRadius: 3,
                        background: 'var(--border)', overflow: 'hidden', flexShrink: 0,
                    }}>
                        <div style={{
                            width: `${progress}%`, height: '100%',
                            background: atMax ? 'var(--danger)' : 'var(--gradient-primary)',
                            borderRadius: 3,
                            transition: 'width 0.3s ease',
                        }} />
                    </div>
                </div>
            </div>

            <div className="ob-nav">
                <button className="ob-nav-btn ob-nav-btn--primary ob-nav-btn--flex" onClick={handleNext} disabled={saving}>
                    {saving ? 'Guardando…' : 'Continuar'}
                    <span className="material-symbols-rounded ob-nav-btn-icon">arrow_forward</span>
                </button>
            </div>
        </>
    );
}
