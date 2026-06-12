// src/views/company/CompanySwipe.jsx
// Reutiliza el SwipeStack del candidato para explorar candidatos
import { useNavigate } from 'react-router-dom';
import SwipeStack from '../../components/swipe/SwipeStack';

export default function CompanySwipe() {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            // --app-height: 100vh desborda (app-container ya reserva los safe
            // insets) y los botones X/corazón quedaban bajo la barra de gestos
            height: 'var(--app-height, 100vh)',
            background: 'var(--bg)',
        }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
            }}>
                <button
                    onClick={() => navigate('/company/dashboard')}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <span style={{
                    flex: 1,
                    fontSize: '17px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                }}>
                    Explorar candidatos
                </span>
                <button
                    onClick={() => navigate('/company/filters')}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                    aria-label="Filtros"
                >
                    <span className="material-symbols-rounded">tune</span>
                </button>
            </header>

            {/* SwipeStack reutilizado */}
            <div style={{ flex: 1, minHeight: 0 }}>
                <SwipeStack
                    onCardTap={(profile) => navigate(`/company/candidate/${profile.id}`)}
                />
            </div>
        </div>
    );
}
