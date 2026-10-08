import type { ComponentPropsWithRef, MouseEventHandler } from 'react';
import { cx } from '../cx';
import { IconClose, IconLike } from '../icons';

/** `yes` = «Me interesa» · `no` = «No me interesa». */
export type ActionPairChoice = 'yes' | 'no';

/** Props extra de un botón del par (catálogo: `className="is-pressed"` / `"is-focus"`; deck: `ref`). */
export type ActionPairButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children' | 'type' | 'onClick'>;

export interface ActionPairProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
    /** «Me interesa»: hace lo mismo que el swipe a la derecha (postular, invitar a postular). */
    onYes: MouseEventHandler<HTMLButtonElement>;
    /** «No me interesa»: hace lo mismo que el swipe a la izquierda. */
    onNo: MouseEventHandler<HTMLButtonElement>;
    /** Ambos deshabilitados (sin conexión, vista previa al publicar). */
    disabled?: boolean;
    /** El botón que espera la respuesta: spinner en su círculo y no se puede volver a tocar. */
    loading?: ActionPairChoice;
    /**
     * Texto para lectores de pantalla mientras carga («Enviando tu
     * postulación…»): se anuncia en una región `role="status"` y se suma al
     * nombre del botón que carga.
     */
    loadingLabel?: string;
    /**
     * Sobre qué se decide, solo para lectores de pantalla, cuando hay varios
     * pares en la pantalla: «Me interesa, Jorge Muñoz».
     */
    subject?: string;
    /**
     * Deck: mientras la tarjeta se arrastra hacia un lado, el botón de ese
     * lado se ve presionado (decisiones M1·L6 punto 14). El arrastre no tiene
     * selector nativo en bundle.css (no hay `:active` sobre el botón), así que
     * pone `is-pressed`: es el caso que admite la regla 4 de `src/ui/README`.
     */
    dragging?: ActionPairChoice;
    yesProps?: ActionPairButtonProps;
    noProps?: ActionPairButtonProps;
}

interface ApButtonProps extends ActionPairButtonProps {
    choice: ActionPairChoice;
    onClick: MouseEventHandler<HTMLButtonElement>;
    loading: boolean;
    loadingLabel?: string;
    subject?: string;
    dragging: boolean;
}

function ApButton({ choice, onClick, loading, loadingLabel, subject, dragging, className, ...rest }: ApButtonProps) {
    const yes = choice === 'yes';
    const Icon = yes ? IconLike : IconClose;
    const label = yes ? 'Me interesa' : 'No me interesa';
    // El nombre se arma en aria-label (empieza con el texto visible): con
    // spans .tl-vh, que son position:absolute, Chrome mete un espacio antes
    // de la coma («Me interesa , Jorge Muñoz»).
    const extra = subject || (loading && loadingLabel);
    const name = extra
        ? [label, subject].filter(Boolean).join(', ') + (loading && loadingLabel ? `. ${loadingLabel}` : '')
        : undefined;
    return (
        <button
            type="button"
            className={cx('tl-ap', yes && 'tl-ap--yes', dragging && 'is-pressed', loading && 'is-loading', className)}
            aria-label={name}
            aria-busy={loading || undefined}
            onClick={loading ? undefined : onClick}
            {...rest}
        >
            <span className="tl-ap__btn">
                <Icon />
                {loading && <span className="tl-spinner" aria-hidden="true" />}
            </span>
            {label}
        </button>
    );
}

/**
 * El par de decisión: «No me interesa» (círculo outline de 56 con IconClose)
 * y «Me interesa» (círculo `color-primary` de 64 con IconLike), con la
 * etiqueta debajo. El mismo par en el deck de empleos, el detalle y Personas
 * sugeridas. Nunca «LIKE» ni «NOPE».
 */
export function ActionPair({
    onYes,
    onNo,
    disabled,
    loading,
    loadingLabel,
    subject,
    dragging,
    yesProps,
    noProps,
    className,
    ...rest
}: ActionPairProps) {
    return (
        <div className={cx('tl-actionpair', className)} {...rest}>
            {/* Con loadingLabel, la región existe antes de cargar para que el aviso se anuncie. */}
            {loadingLabel && (
                <span className="tl-vh" role="status">
                    {loading ? loadingLabel : ''}
                </span>
            )}
            <ApButton
                {...noProps}
                choice="no"
                onClick={onNo}
                disabled={disabled || noProps?.disabled}
                loading={loading === 'no'}
                loadingLabel={loadingLabel}
                subject={subject}
                dragging={dragging === 'no'}
            />
            <ApButton
                {...yesProps}
                choice="yes"
                onClick={onYes}
                disabled={disabled || yesProps?.disabled}
                loading={loading === 'yes'}
                loadingLabel={loadingLabel}
                subject={subject}
                dragging={dragging === 'yes'}
            />
        </div>
    );
}
