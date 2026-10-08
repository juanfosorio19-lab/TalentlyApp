import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { cx } from '../cx';
import { IconMatchHeart } from '../icons';
import { useOverlay } from '../overlay';
import { useLayerExit, useLayerPresence } from '../overlay/useLayerPresence';
import { useModalFocus } from '../overlay/useModalFocus';

export interface MatchParty {
    /** Nombre completo: de aquí salen las iniciales del Avatar. */
    name: string;
    /** Foto real, si la hay (prestadores de servicios). */
    photo?: string | null;
}

export interface MatchOrg extends MatchParty {
    /** Nombre corto para el texto («Seguridad Andes» de «Seguridad Andes Ltda.»). */
    shortName?: string;
}

export interface MatchModalProps {
    open: boolean;
    /**
     * «Seguir explorando»: cierra. También lo disparan tocar el velo, Escape
     * y el atrás de Android.
     */
    onClose: () => void;
    /** «Enviar mensaje»: abre la conversación (MSG-02). */
    onMessage: () => void;
    /** Persona, redonda a la izquierda. */
    person: MatchParty;
    /** Organización u hogar («Familia en …»), cuadrada a la derecha. */
    org: MatchOrg;
    /** Título de la publicación: «Guardia de seguridad 4x4». */
    publication: string;
    /** Texto en Body-L. Por defecto «{Organización} quiere conversar contigo sobre {publicación}». */
    text?: ReactNode;
    /** `false`: se dibuja en su lugar (catálogo, marcos de 390) en vez de en `document.body`. */
    portal?: boolean;
    /**
     * `false`: solo para mostrarlo abierto en el catálogo; no toma ni atrapa
     * el foco y no entra en la pila de capas.
     */
    modal?: boolean;
    className?: string;
}

/**
 * El aviso de match (DET-03): aparece una vez sobre el velo cuando una
 * organización o un hogar responde «Me interesa» a una postulación. Franja
 * `gradient-brand` solo con los dos avatares (nada de texto encima),
 * «¡Hicieron match!» en Display, «Enviar mensaje» y «Seguir explorando». Es
 * el único modal que celebra; para confirmar se usa Dialog. Al abrir, el foco
 * va a «Enviar mensaje» (el título se lee primero) y al cerrar vuelve a donde
 * estaba.
 */
export function MatchModal({ open, ...props }: MatchModalProps) {
    // Al cerrar sigue montado mientras dura su salida (la del velo, en app.css).
    const { mounted, exited } = useLayerPresence(open);
    return mounted ? <MatchLayer {...props} closing={!open} onExited={exited} /> : null;
}

function MatchLayer({
    onClose,
    onMessage,
    person,
    org,
    publication,
    text,
    portal = true,
    modal = true,
    className,
    closing,
    onExited,
}: Omit<MatchModalProps, 'open'> & { closing: boolean; onExited: () => void }) {
    const titleId = useId();
    const textId = useId();
    const cardRef = useRef<HTMLDivElement>(null);
    const messageRef = useRef<HTMLButtonElement>(null);

    // Al empezar a cerrar sale de la pila de capas y devuelve el foco; ya no se toca (`inert`).
    const active = modal && !closing;
    useOverlay(active, onClose);
    useModalFocus(active, cardRef, messageRef);
    useLayerExit(closing, cardRef, onExited);

    const layer = (
        <>
            <div className={cx('tl-scrim', closing && 'is-closing')} aria-hidden="true" inert={closing} onClick={onClose} />
            <div
                ref={cardRef}
                className={cx('tl-match', closing && 'is-closing', className)}
                role="dialog"
                aria-modal={modal || undefined}
                aria-labelledby={titleId}
                aria-describedby={textId}
                inert={closing}
            >
                <div className="tl-match__band">
                    <div className="tl-match__pair">
                        <Avatar name={person.name} photo={person.photo} size={96} />
                        <Avatar name={org.name} photo={org.photo} kind="org" size={96} />
                    </div>
                </div>
                <div className="tl-match__body">
                    <span className="tl-match__icon">
                        <IconMatchHeart />
                    </span>
                    <h2 className="tl-match__title display" id={titleId}>
                        ¡Hicieron match!
                    </h2>
                    <p className="tl-match__text body-l" id={textId}>
                        {text ?? `${org.shortName ?? org.name} quiere conversar contigo sobre ${publication}`}
                    </p>
                    <div className="tl-match__actions">
                        <Button ref={messageRef} size="lg" block onClick={onMessage}>
                            Enviar mensaje
                        </Button>
                        <Button variant="ghost" size="lg" block onClick={onClose}>
                            Seguir explorando
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );

    return portal ? createPortal(layer, document.body) : layer;
}
