// Lista de datos con ícono de 16 (`ul.tl-pub__facts`): la de «Confirmo
// asistencia» de TUR-01 en el prototipo, con un check `color-success-text` en
// lo hecho y un reloj en lo pendiente. src/ui la usa dentro de PublicationCard
// pero no la exporta sola (pedido en requests): aquí se arma con el mismo
// marcado de bundle.css y los íconos del set, sin estilos propios.
import { cx } from '../../../ui/cx';
import { IconCheck, IconClock } from '../../../ui/icons';
import '../activity.css';

export interface Fact {
    /** «24 h antes · confirmaste ayer a las 19:04». */
    text: string;
    /** Hecho: check y `color-success-text` (`tl-pub__fact--ok`); si no, reloj en `color-text-2`. */
    done: boolean;
}

export interface FactListProps {
    facts: readonly Fact[];
    /** Estado oculto para el lector de pantalla (el check y el color no se leen). */
    doneLabel?: string;
    pendingLabel?: string;
}

export function FactList({ facts, doneLabel = 'Hecho: ', pendingLabel = 'Pendiente: ' }: FactListProps) {
    return (
        <ul className="tl-pub__facts act-facts">
            {facts.map((fact) => {
                const Icon = fact.done ? IconCheck : IconClock;
                return (
                    <li key={fact.text} className={cx('tl-pub__fact', fact.done && 'tl-pub__fact--ok')}>
                        <Icon />
                        <span>
                            <span className="tl-vh">{fact.done ? doneLabel : pendingLabel}</span>
                            {fact.text}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
