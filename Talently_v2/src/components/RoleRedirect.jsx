// src/components/RoleRedirect.jsx
// Detecta el tipo de usuario y el estado de onboarding, y redirige:
//   - sin profile o onboarding incompleto → /onboarding/<tipo>
//   - onboarding completo + candidate → /app
//   - onboarding completo + company → /company/dashboard
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRedirect() {
    const { user, profile, userType, authReady } = useAuth();

    if (!authReady) return null;
    if (!user) return <Navigate to="/login" replace />;

    // Si el profile aún no existe en BD (user recién creado), el tipo viene
    // del user_metadata (RegisterView lo setea allí en el signUp options).
    const effectiveType = userType || user?.user_metadata?.user_type || 'candidate';

    // Sin profile o onboarding pendiente → al wizard correspondiente
    if (!profile || !profile.onboarding_completed) {
        return effectiveType === 'company'
            ? <Navigate to="/onboarding/company" replace />
            : <Navigate to="/onboarding/candidate" replace />;
    }

    // Onboarding completo → dashboard del rol
    return effectiveType === 'company'
        ? <Navigate to="/company/dashboard" replace />
        : <Navigate to="/app" replace />;
}
