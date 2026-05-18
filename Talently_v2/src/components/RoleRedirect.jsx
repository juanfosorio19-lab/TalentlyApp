// src/components/RoleRedirect.jsx
// Detecta el tipo de usuario (candidate/company) y redirige a su dashboard.
// Se usa en rutas como /dashboard que deben redirigir según el rol.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRedirect() {
    const { userType, loading } = useAuth();

    if (loading) return null;

    if (userType === 'company') {
        return <Navigate to="/company/dashboard" replace />;
    }

    // Default: candidate (or unknown type)
    return <Navigate to="/app/swipe" replace />;
}
