import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button/Button';
import { cx } from '../cx';
import { IconClose } from '../icons';
import { IconButton } from '../IconButton/IconButton';
import { useOverlay } from '../overlay';
import { useLayerExit, useLayerPresence } from '../overlay/useLayerPresence';
import { useModalFocus } from '../overlay/useModalFocus';

const noop = () => {};

interface DialogBaseProps {
    open: boolean;
    /**
     * La acción que no destruye: «Seguir editando» / «Cancelar». También la
     * disparan tocar el velo, Escape y el atrás de Android. Mientras
     * `loading`, ninguno de ellos cierra.
     */
    onClose: () => void;
    /** Título en pregunta: «¿Descartar cambios?». */
    title: ReactNode;
    /**
     * Teléfono: una o dos frases con la consecuencia (van en `p.tl-dialog__body`).
     * Web: el contenido que se desplaza (párrafos, motivo con Radio, TextArea).
     */
    children: ReactNode;
    /** Etiqueta de la acción que no destruye. */
    cancelLabel?: string;
    /** Etiqueta de la acción que confirma, en infinitivo: «Descartar», «Eliminar», «Pausar». */
    confirmLabel: string;
    onConfirm: () => void;
    /** Confirmar destruye: la acción va en danger. Si no, en primary. */
    destructive?: boolean;
    /**
     * La acción que confirma muestra su estado cargando mientras se confirma:
     * no se puede volver a disparar (ni con Enter o Espacio) y el diálogo no
     * se cierra hasta que termine.
     */
    loading?: boolean;
    /** Texto para lectores de pantalla mientras carga («Eliminando…»). */
    loadingLabel?: string;
    /** `false`: se dibuja en su lugar (catálogo, marcos de 390) en vez de en `document.body`. */
    portal?: boolean;
    /**
     * `false`: solo para mostrarlo abierto en el catálogo; no toma ni atrapa el
     * foco y no entra en la pila de capas.
     */
    modal?: boolean;
    className?: string;
}

/** Teléfono: sus dos acciones siempre funcionan. */
export interface DialogPhoneProps extends DialogBaseProps {
    variant?: undefined;
    confirmDisabled?: never;
}

/** `web`: backoffice de escritorio (560, cabecera con Cerrar, contenido que se desplaza). */
export interface DialogWebProps extends DialogBaseProps {
    variant: 'web';
    /** Confirmar espera a que se elija el motivo («Rechazar con motivo»). */
    confirmDisabled?: boolean;
}

export type DialogProps = DialogPhoneProps | DialogWebProps;

/**
 * Ventana de confirmación, solo para confirmar («¿Descartar cambios?»). Para
 * elegir o filtrar se usa BottomSheet. Al abrir, el foco va a la acción que
 * no destruye.
 */
export function Dialog({ open, ...props }: DialogProps) {
    // Al cerrar sigue montado mientras dura su salida.
    const { mounted, exited } = useLayerPresence(open);
    return mounted ? <DialogLayer {...props} closing={!open} onExited={exited} /> : null;
}

function DialogLayer({
    onClose,
    title,
    children,
    cancelLabel = 'Cancelar',
    confirmLabel,
    onConfirm,
    destructive,
    loading,
    loadingLabel,
    confirmDisabled,
    variant,
    portal = true,
    modal = true,
    className,
    closing,
    onExited,
}: Omit<DialogProps, 'open'> & { closing: boolean; onExited: () => void }) {
    const titleId = useId();
    const bodyId = useId();
    const dialogRef = useRef<HTMLDivElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const web = variant === 'web';
    // Mientras se confirma, velo, Escape, atrás y Cerrar no cierran a medio camino.
    const close = loading ? noop : onClose;

    // Al empezar a cerrar sale de la pila de capas y devuelve el foco; ya no se toca (`inert`).
    const active = modal && !closing;
    useOverlay(active, close);
    useModalFocus(active, dialogRef, cancelRef);
    useLayerExit(closing, dialogRef, onExited);

    const heading = (
        <h2 className="tl-dialog__title h2" id={titleId}>
            {title}
        </h2>
    );

    const layer = (
        <>
            <div className={cx('tl-scrim', closing && 'is-closing')} aria-hidden="true" inert={closing} onClick={close} />
            <div
                ref={dialogRef}
                className={cx('tl-dialog', web && 'tl-dialog--web', closing && 'is-closing', className)}
                role="alertdialog"
                aria-modal={modal || undefined}
                aria-labelledby={titleId}
                aria-describedby={bodyId}
                inert={closing}
            >
                {web ? (
                    <>
                        <div className="tl-dialog__head">
                            {heading}
                            <IconButton icon={IconClose} label="Cerrar" onClick={close} />
                        </div>
                        <div className="tl-dialog__content" id={bodyId}>
                            {children}
                        </div>
                    </>
                ) : (
                    <>
                        {heading}
                        <p className="tl-dialog__body" id={bodyId}>
                            {children}
                        </p>
                    </>
                )}
                <div className="tl-dialog__actions">
                    <Button ref={cancelRef} variant="ghost" onClick={close} aria-disabled={loading || undefined}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={destructive ? 'danger' : 'primary'}
                        // `is-loading` solo corta el puntero: Enter y Espacio también se ignoran.
                        onClick={loading ? undefined : onConfirm}
                        aria-disabled={loading || undefined}
                        loading={loading}
                        loadingLabel={loadingLabel}
                        disabled={confirmDisabled}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </>
    );

    return portal ? createPortal(layer, document.body) : layer;
}
