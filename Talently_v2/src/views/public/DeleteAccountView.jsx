// src/views/public/DeleteAccountView.jsx
// Eliminación de cuenta — requiere auth, accesible desde Settings
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '../../lib/supabase';
import { useApp, Actions } from '../../context/AppContext';
import './DeleteAccountView.css';

const CONFIRM_WORD = 'ELIMINAR';

const CONSEQUENCES = [
    'Tu perfil profesional será eliminado por completo.',
    'Perderás todos tus matches y conversaciones actuales.',
    'Esta acción es irreversible y no podrás recuperar tu información.',
];

export default function DeleteAccountView() {
    const navigate  = useNavigate();
    const { dispatch } = useApp();

    const [confirmText, setConfirmText] = useState('');
    const [loading,     setLoading]     = useState(false);
    const [rpcMissing,  setRpcMissing]  = useState(false);

    const confirmed = confirmText === CONFIRM_WORD;

    const handleDelete = async () => {
        if (!confirmed || loading) return;
        setLoading(true);
        try {
            const { error } = await db.auth.deleteAccount();
            if (error) {
                // Función RPC no existe o falló — hacer signOut y mostrar aviso
                setRpcMissing(true);
                await supabase.auth.signOut();
                dispatch({ type: Actions.LOGOUT });
                return;
            }
            dispatch({ type: Actions.LOGOUT });
            navigate('/', { replace: true });
        } catch {
            setRpcMissing(true);
            await supabase.auth.signOut();
            dispatch({ type: Actions.LOGOUT });
        } finally {
            setLoading(false);
        }
    };

    // ── Estado: RPC no disponible ──
    if (rpcMissing) {
        return (
            <div className="dav">
                <header className="dav__header">
                    <button
                        className="dav__back"
                        onClick={() => navigate('/')}
                        aria-label="Volver"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <h1 className="dav__title">Eliminar cuenta</h1>
                    <div className="dav__spacer" />
                </header>

                <div className="dav__rpc-missing">
                    <div className="dav__rpc-icon-wrap">
                        <span className="material-symbols-rounded dav__rpc-icon">info</span>
                    </div>
                    <h2 className="dav__rpc-title">Solicitud recibida</h2>
                    <p className="dav__rpc-sub">
                        La eliminación automática no está disponible aún. Tu sesión ha sido cerrada. Para completar el proceso, contáctanos directamente:
                    </p>
                    <a href="mailto:soporte@talently.app" className="dav__rpc-email-btn">
                        <span className="material-symbols-rounded">mail</span>
                        soporte@talently.app
                    </a>
                    <button className="dav__rpc-home-btn" onClick={() => navigate('/')}>
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dav">
            {/* ── Header ── */}
            <header className="dav__header">
                <button
                    className="dav__back"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h1 className="dav__title">Eliminar cuenta</h1>
                <div className="dav__spacer" />
            </header>

            {/* ── Contenido ── */}
            <main className="dav__main">

                {/* ── Warning ── */}
                <section className="dav__warning">
                    <div className="dav__danger-icon-wrap">
                        <span className="material-symbols-rounded dav__danger-icon">warning</span>
                    </div>
                    <h2 className="dav__warning-title">¿Estás seguro?</h2>
                    <p className="dav__warning-sub">
                        Si eliminas tu cuenta, se perderán todos tus datos permanentemente.
                    </p>
                </section>

                {/* ── Consecuencias ── */}
                <section className="dav__consequences">
                    {CONSEQUENCES.map((text, i) => (
                        <div key={i} className="dav__consequence-row">
                            <span className="dav__consequence-dot" />
                            <p className="dav__consequence-text">{text}</p>
                        </div>
                    ))}
                </section>

                {/* ── Confirmación ── */}
                <section className="dav__confirm-section">
                    <label className="dav__confirm-label" htmlFor="dav-confirm-input">
                        Para confirmar, escribe{' '}
                        <strong className="dav__confirm-keyword">{CONFIRM_WORD}</strong>{' '}
                        en el campo de abajo
                    </label>
                    <input
                        id="dav-confirm-input"
                        className={`dav__confirm-input ${confirmed ? 'dav__confirm-input--valid' : ''}`}
                        type="text"
                        placeholder={`Escribe ${CONFIRM_WORD}`}
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </section>

                {/* ── Botones ── */}
                <section className="dav__actions">
                    <button
                        className={`dav__delete-btn ${confirmed ? 'dav__delete-btn--active' : ''} ${loading ? 'dav__delete-btn--loading' : ''}`}
                        onClick={handleDelete}
                        disabled={!confirmed || loading}
                    >
                        {loading ? (
                            <span className="dav__spinner" />
                        ) : (
                            'Eliminar mi cuenta'
                        )}
                    </button>

                    <button
                        className="dav__cancel-btn"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                </section>

            </main>
        </div>
    );
}
