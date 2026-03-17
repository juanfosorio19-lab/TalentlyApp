// src/components/ui/SectionCard.jsx
import './SectionCard.css';

export default function SectionCard({ icon, title, children }) {
    return (
        <div className="ui-card">
            <div className="ui-card__header">
                {icon && (
                    <span className="material-symbols-rounded ui-card__icon">{icon}</span>
                )}
                <h3 className="ui-card__title">{title}</h3>
            </div>
            <div className="ui-card__body">
                {children}
            </div>
        </div>
    );
}
