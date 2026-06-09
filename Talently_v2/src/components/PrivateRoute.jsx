// src/components/PrivateRoute.jsx
// Protege rutas que requieren autenticación.
// Si no hay sesión → redirige a /login
// Mientras carga la sesión → muestra spinner
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
    const { isAuthenticated, authReady } = useAuth();

    if (!authReady) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                color: 'var(--text-muted)'
            }}>
                <span className="material-symbols-rounded" style={{
                    fontSize: '40px',
                    animation: 'spin 1s linear infinite'
                }}>
                    progress_activity
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
