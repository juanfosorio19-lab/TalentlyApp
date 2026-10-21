// Fila «Ofertas cerca de Macul · Ver lista» (EXP-01) y «8 personas sugeridas ·
// Ver de a una» (EXP-05): qué se está viendo y el cambio de vista deck/lista.
import { Button } from '../../../ui/Button';

export interface ExploreBarProps {
    text: string;
    /** «Ver lista» o «Ver de a una». Sin él, solo el texto. */
    toggleLabel?: string;
    onToggle?: () => void;
}

export function ExploreBar({ text, toggleLabel, onToggle }: ExploreBarProps) {
    return (
        <div className="explore-bar">
            <p className="explore-bar__text button-md">{text}</p>
            {toggleLabel && onToggle && (
                <Button variant="ghost" size="sm" onClick={onToggle}>
                    {toggleLabel}
                </Button>
            )}
        </div>
    );
}
