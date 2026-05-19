// src/components/RoleGate.jsx
// Autorización por rol: verifica que userType coincida con el tipo permitido
// para la ruta. Si no, redirige a /dashboard (RoleRedirect lo manda al
// dashboard correcto del rol del user).
//
// Uso en App.jsx:
//   <Route element={<RoleGate type="candidate" />}>
//     <Route path="/app" ... />
//     ...
//   </Route>
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleGate({ type }) {
    const { user, userType, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    // userType viene del profile (si existe) — pero RoleGate se monta DESPUÉS
    // del OnboardingGate, así que profile YA existe y userType está populado.
    if (userType !== type) {
        // Rol incorrecto: rebotar al /dashboard (RoleRedirect decide a dónde).
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
