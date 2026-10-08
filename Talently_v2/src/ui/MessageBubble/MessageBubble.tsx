import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';
import { Button } from '../Button';
import { cx } from '../cx';
import { IconAlert, IconClock } from '../icons';
import { Spinner } from '../Spinner';

/**
 * Estado real de un mensaje propio (decisiones M1·L5 punto 4 y M5 punto 7):
 * `sending` «Enviando…» · `sent` «Enviado» · `read` «Leído» (solo si la otra
 * parte lo abrió) · `error` «No se envió» + «Reintentar» · `queued` sin
 * conexión, «Se enviará cuando vuelva la conexión».
 */
export type MessageStatus = 'sending' | 'sent' | 'read' | 'error' | 'queued';

export interface MessageBubbleProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
    /** Texto del mensaje, en 16. Los saltos de línea se respetan. */
    children: ReactNode;
    /** Propio: a la derecha en `color-primary`. Ajeno: a la izquierda en `color-surface-2`. */
    own?: boolean;
    /** Hora en que se envió («12:44»). Va debajo de la burbuja, en Caption. */
    time: string;
    /** Solo en mensajes propios. Sin estado, la meta muestra solo la hora. */
    status?: MessageStatus;
    /**
     * «Reintentar» de un mensaje que no se envió. Sin handler no se muestra el
     * botón. Con «Enviando…» el botón se va: si tenía el foco (teclado, lector
     * de pantalla), el foco pasa a la burbuja y no cae en `<body>`. Para eso la
     * pantalla mantiene la `key` del mensaje al reenviarlo.
     */
    onRetry?: () => void;
    /**
     * Quién lo escribió, solo para lectores de pantalla (la conversación se
     * recorre mensaje a mensaje). Propio: «Tú». Ajeno: el nombre de la otra
     * parte («Banquetería Rosa SpA»).
     */
    sender?: string;
}

const STATUS_TEXT: Partial<Record<MessageStatus, string>> = { sent: 'Enviado', read: 'Leído' };

/**
 * Burbuja de chat (`.tl-msg` > `.tl-bubble` + `.tl-msg__meta`). La hora y el
 * estado van debajo, nunca dentro (no se pone texto de 12 sobre morado). No
 * se toca ni se marca: el menú «Copiar» / «Reportar» al mantener presionado lo
 * pone la pantalla (`onContextMenu`), y la burbuja no cambia.
 */
export function MessageBubble({
    children,
    own,
    time,
    status,
    onRetry,
    sender,
    className,
    ...rest
}: MessageBubbleProps) {
    // El estado es solo de lo propio: de un mensaje ajeno no se sabe nada más que la hora.
    const state = own ? status : undefined;
    const who = sender ?? (own ? 'Tú' : undefined);

    const retry = (e: MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        // El botón se desmonta con «Enviando…»: si tenía el foco, lo toma la burbuja (tabIndex -1).
        if (button === document.activeElement) button.closest<HTMLElement>('.tl-msg')?.focus({ preventScroll: true });
        onRetry?.();
    };

    let meta: ReactNode;
    if (state === 'sending') {
        meta = (
            <>
                <Spinner size={16} />
                <span>Enviando…</span>
            </>
        );
    } else if (state === 'error') {
        meta = (
            <>
                <IconAlert size={16} />
                <span>No se envió</span>
                {onRetry && (
                    <Button variant="ghost" size="sm" onClick={retry}>
                        Reintentar
                    </Button>
                )}
            </>
        );
    } else if (state === 'queued') {
        meta = (
            <>
                <IconClock size={16} />
                <span>Se enviará cuando vuelva la conexión</span>
            </>
        );
    } else {
        const text = state ? STATUS_TEXT[state] : undefined;
        meta = text ? `${time} · ${text}` : time;
    }

    return (
        <div
            className={cx(
                'tl-msg',
                own && 'tl-msg--own',
                state === 'error' && 'tl-msg--error',
                state === 'queued' && 'tl-msg--queued',
                // Fuera del orden de tabulación; solo recibe el foco al dejar «Reintentar» (foco oficial).
                own && 'tl-focus',
                className,
            )}
            tabIndex={own ? -1 : undefined}
            {...rest}
        >
            <div className="tl-bubble">
                {who && <span className="tl-vh">{`${who}: `}</span>}
                {children}
            </div>
            <div className="tl-msg__meta">{meta}</div>
        </div>
    );
}

export interface ChatProps extends ComponentPropsWithRef<'div'> {
    /** Nombre de la conversación para lectores de pantalla: «Conversación con Banquetería Rosa SpA». */
    label: string;
}

/**
 * La conversación (`.tl-chat`, `role="log"`): columna de MessageBubble,
 * SystemCard y separadores de día, con 8 entre cada uno y 16 de margen. Lo
 * nuevo que llega se anuncia solo. Arriba, fijo bajo el AppBar de
 * conversación, va el ContextChip (`ContextChipBar`); abajo, el Composer.
 */
export function Chat({ label, className, ...rest }: ChatProps) {
    return <div className={cx('tl-chat', className)} role="log" aria-label={label} {...rest} />;
}

export interface ChatDayProps extends Omit<ComponentPropsWithRef<'p'>, 'children'> {
    /** «Hoy», «Ayer», «12 dic». */
    children: ReactNode;
}

/** Separador de día dentro de la conversación (`.tl-chat__day`), centrado en Caption. */
export function ChatDay({ className, ...rest }: ChatDayProps) {
    return <p className={cx('tl-chat__day', className)} {...rest} />;
}
