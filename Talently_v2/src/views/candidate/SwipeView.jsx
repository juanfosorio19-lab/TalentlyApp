// SwipeView.jsx — redirige a /app donde vive el MainApp con el SwipeStack real.
// La experiencia de swipe está en MainApp (ruta /app), no como vista standalone.
import { Navigate } from 'react-router-dom';

export default function SwipeView() {
    return <Navigate to="/app" replace />;
}
