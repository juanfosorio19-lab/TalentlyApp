// src/views/public/FAQView.jsx
// Preguntas frecuentes — pública, accesible desde Settings
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { FAQS_DATA } from '../../data/constants';
import { Spinner } from '../../components/ui';
import './FAQView.css';

const CATEGORIES = ['General', 'Para candidatos', 'Para empresas'];

// ── Acordeón individual ───────────────────────
function FAQItem({ faq, isOpen, onToggle }) {
    return (
        <div className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
            <button
                className="faq-item__summary"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <p className="faq-item__question">{faq.question}</p>
                <span className="material-symbols-rounded faq-item__chevron">
                    expand_more
                </span>
            </button>
            {isOpen && (
                <div className="faq-item__body">
                    <p className="faq-item__answer">{faq.answer}</p>
                </div>
            )}
        </div>
    );
}

// ── Vista principal ───────────────────────────
export default function FAQView() {
    const navigate = useNavigate();

    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('General');
    const [search, setSearch] = useState('');
    const [openId, setOpenId] = useState(null);

    // ── Cargar FAQs (Supabase con fallback a estáticas) ──
    useEffect(() => {
        const load = async () => {
            try {
                // Verificar si existe la tabla intentando cargar una fila
                const { data, error } = await db.faqs.getAll();
                if (!error && data && data.length > 0) {
                    setFaqs(data);
                } else {
                    setFaqs(FAQS_DATA);
                }
            } catch {
                setFaqs(FAQS_DATA);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ── Filtrar FAQs ──
    const filtered = useMemo(() => {
        let result = faqs;

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (f) =>
                    f.question.toLowerCase().includes(q) ||
                    f.answer.toLowerCase().includes(q)
            );
        } else {
            result = result.filter((f) => f.category === activeCategory);
        }

        return result;
    }, [faqs, activeCategory, search]);

    const handleToggle = (id) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        setSearch('');
        setOpenId(null);
    };

    const handleClearSearch = () => {
        setSearch('');
        setOpenId(null);
    };

    return (
        <div className="faqv-wrapper">
            {/* ── Header ── */}
            <header className="faqv-header">
                <button
                    className="faqv-back-btn"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h1 className="faqv-header-title">Preguntas frecuentes</h1>
            </header>

            <main className="faqv-main">
                {/* ── Buscador ── */}
                <div className="faqv-search-row">
                    <div className="faqv-search-wrap">
                        <span className="material-symbols-rounded faqv-search-icon">search</span>
                        <input
                            className="faqv-search-input"
                            type="text"
                            placeholder="Buscar dudas..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setOpenId(null); }}
                        />
                        {search && (
                            <button className="faqv-search-clear" onClick={handleClearSearch} aria-label="Limpiar">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Chips de categoría (ocultos durante búsqueda) ── */}
                {!search && (
                    <div className="faqv-chips">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                className={`faqv-chip ${activeCategory === cat ? 'faqv-chip--active' : ''}`}
                                onClick={() => handleCategoryChange(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Lista de acordeones ── */}
                {loading ? (
                    <div className="faqv-loading"><Spinner /></div>
                ) : filtered.length > 0 ? (
                    <div className="faqv-list">
                        {filtered.map((faq) => (
                            <FAQItem
                                key={faq.id}
                                faq={faq}
                                isOpen={openId === faq.id}
                                onToggle={() => handleToggle(faq.id)}
                            />
                        ))}
                    </div>
                ) : (
                    /* ── Estado vacío ── */
                    <div className="faqv-empty">
                        <div className="faqv-empty-icon-wrap">
                            <span className="material-symbols-rounded faqv-empty-icon">search_off</span>
                        </div>
                        <h3 className="faqv-empty-title">No se encontraron resultados</h3>
                        <p className="faqv-empty-sub">Intenta con otras palabras clave o explora las categorías.</p>
                        {search && (
                            <button className="faqv-empty-btn" onClick={handleClearSearch}>
                                Limpiar búsqueda
                            </button>
                        )}
                    </div>
                )}

                {/* ── Footer de contacto ── */}
                <div className="faqv-contact">
                    <p className="faqv-contact-text">¿Aún tienes dudas?</p>
                    <a
                        href="mailto:soporte@talently.app"
                        className="faqv-contact-btn"
                    >
                        <span className="material-symbols-rounded">mail</span>
                        Contáctanos
                    </a>
                </div>
            </main>
        </div>
    );
}
