// Company Step 9 — Proceso de selección (texto libre, opcional)
import { useState } from 'react';

const MAX_CHARS = 500;

export default function Step9_ProcesoSeleccion({ data, onNext, saving }) {
    const [selectionProcess, setSelectionProcess] = useState(data.selection_process || '');

    const handleChange = (e) => {
        if (e.target.value.length <= MAX_CHARS) setSelectionProcess(e.target.value);
    };

    const handleNext = () => {
        onNext({ selection_process: selectionProcess.trim() });
    };

    return (
        <>
            <h2 className="ob-title">¿Qué debe esperar el candidato en tu proceso?</h2>
            <p className="ob-subtitle">Descríbelo en detalle para atraer al candidato ideal.</p>

            <div className="ob-content">
                <div className="ob-field">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <label className="ob-label" style={{ marginBottom: 0 }}>Descripción del proceso</label>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Campo opcional
                        </span>
                    </div>

                    <div className="ob-input-wrapper" style={{ alignItems: 'flex-start' }}>
                        <span className="material-symbols-rounded ob-input-icon" style={{ marginTop: 14 }}>
                            checklist
                        </span>
                        <textarea
                            className="ob-input"
                            placeholder="Ej: Primera entrevista con RRHH → prueba técnica → entrevista con el equipo..."
                            value={selectionProcess}
                            onChange={handleChange}
                            rows={7}
                            style={{ resize: 'none', lineHeight: 1.6 }}
                        />
                    </div>

                    {/* Contador de caracteres */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                        <span style={{
                            fontSize: 12,
                            color: selectionProcess.length >= MAX_CHARS ? 'var(--danger)' : 'var(--text-muted)',
                            fontWeight: 500,
                            background: 'var(--bg)',
                            padding: '2px 8px',
                            borderRadius: 6,
                        }}>
                            {selectionProcess.length} / {MAX_CHARS}
                        </span>
                    </div>
                </div>

                {/* Tip card */}
                <div style={{
                    display: 'flex',
                    gap: 12,
                    padding: 16,
                    borderRadius: 14,
                    background: 'rgba(var(--primary-rgb), 0.06)',
                    border: '1px solid rgba(var(--primary-rgb), 0.15)',
                }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22, color: 'var(--primary)', flexShrink: 0 }}>
                        lightbulb
                    </span>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                        Los procesos transparentes aumentan la tasa de respuesta de los mejores talentos en un <strong>30%</strong>.
                    </p>
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
