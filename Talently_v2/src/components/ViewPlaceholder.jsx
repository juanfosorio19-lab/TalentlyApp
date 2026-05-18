// src/components/ViewPlaceholder.jsx
// Componente temporal para vistas no migradas — muestra el nombre de la vista
// Se eliminará cuando cada vista tenga su implementación real
import { useNavigate } from 'react-router-dom';

export default function ViewPlaceholder({ name, icon = 'construction' }) {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '16px',
            padding: '24px',
            textAlign: 'center'
        }}>
            <span className="material-symbols-rounded" style={{
                fontSize: '56px',
                color: 'var(--primary-light)',
                opacity: 0.6
            }}>
                {icon}
            </span>
            <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--text-primary)'
            }}>
                {name}
            </h2>
            <p style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                maxWidth: '280px'
            }}>
                Vista en migración. Este componente será reemplazado.
            </p>
            <button
                onClick={() => navigate(-1)}
                style={{
                    marginTop: '8px',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    border: '2px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                }}
            >
                ← Volver
            </button>
        </div>
    );
}
