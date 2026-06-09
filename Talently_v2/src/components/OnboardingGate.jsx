// src/components/OnboardingGate.jsx
// Protege rutas que requieren onboarding completo.
// Si el user está autenticado pero NO completó onboarding → redirect al wizard.
// Las rutas /onboarding/* NO deben envolverse con este gate.
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OnboardingGate() {
    const { user, profile, authReady } = useAuth();

    if (!authReady) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', color: 'var(--text-muted)',
            }}>
                <span className="material-symbols-rounded" style={{
                    fontSize: '40px', animation: 'spin 1s linear infinite',
                }}>progress_activity</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    // Sin profile o onboarding incompleto → wizard. Tipo viene de profile (si
    // existe) o de user_metadata (signup pendiente de profile en BD).
    if (!profile || !profile.onboarding_completed) {
        const type = profile?.user_type || user?.user_metadata?.user_type || 'candidate';
        return type === 'company'
            ? <Navigate to="/onboarding/company" replace />
            : <Navigate to="/onboarding/candidate" replace />;
    }

    return <Outlet />;
}
