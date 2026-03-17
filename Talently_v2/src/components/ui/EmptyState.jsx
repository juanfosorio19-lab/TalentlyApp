// src/components/ui/EmptyState.jsx
import './EmptyState.css';

export default function EmptyState({ icon, title, description, buttonLabel, onButtonClick }) {
    return (
        <div className="ui-empty">
            <span className="material-symbols-rounded ui-empty__icon">{icon}</span>
            <h3 className="ui-empty__title">{title}</h3>
            {description && <p className="ui-empty__text">{description}</p>}
            {buttonLabel && onButtonClick && (
                <button className="ui-empty__btn" onClick={onButtonClick}>
                    {buttonLabel}
                </button>
            )}
        </div>
    );
}
