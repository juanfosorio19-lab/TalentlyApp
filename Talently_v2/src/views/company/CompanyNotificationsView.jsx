// src/views/company/CompanyNotificationsView.jsx
// Tabla notifications no existe aún — ver ERROR_LOG.md #10
import { useNavigate } from 'react-router-dom';
import '../candidate/NotificationsView.css';

export default function CompanyNotificationsView() {
    const navigate = useNavigate();

    return (
        <div className="notif-view">
            <header className="notif-view__header">
                <button
                    className="notif-view__back"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h2 className="notif-view__title">Notificaciones</h2>
            </header>

            <div className="notif-view__empty">
                <span className="material-symbols-rounded notif-view__empty-icon">
                    notifications
                </span>
                <h3 className="notif-view__empty-title">Sin notificaciones</h3>
                <p className="notif-view__empty-text">
                    Las notificaciones estarán disponibles pronto.
                </p>
            </div>
        </div>
    );
}
