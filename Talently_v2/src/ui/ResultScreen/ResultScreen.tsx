import { useEffect, useRef, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button';
import { CtaBar } from '../CtaBar';
import { cx } from '../cx';
import { IconAlert, IconCheck, IconInfo, type IconComponent } from '../icons';

export type ResultScreenVariant = 'success' | 'info' | 'error';

export interface ResultScreenAction extends Omit<ButtonProps, 'children' | 'variant' | 'size' | 'block'> {
    /** En infinitivo: «Ver mis postulaciones», «Volver al inicio», «Reintentar». */
    label: string;
}

export interface ResultScreenProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'> {
    /** Éxito (IconCheck), información (IconInfo) o error (IconAlert); el color es fijo por variante. */
    variant: ResultScreenVariant;
    /** Un solo mensaje: qué pasó («Postulaste a Guardia de seguridad 4x4»). */
    title: ReactNode;
    /** Qué viene ahora, sin métricas inventadas ni promesas. Body-L en `color-text-2`. */
    text: ReactNode;
    /** Button primary lg a lo ancho en el CTA fijo. */
    action: ResultScreenAction;
    /** Button ghost lg a lo ancho, debajo («Seguir explorando», «Volver»). */
    secondaryAction?: ResultScreenAction;
    /**
     * Al abrir, el foco va al título para que el lector de pantalla lea el
     * resultado. `false` solo en el catálogo, donde hay varias a la vez.
     */
    focusTitle?: boolean;
}

const ICONS: Record<ResultScreenVariant, IconComponent> = {
    success: IconCheck,
    info: IconInfo,
    error: IconAlert,
};

/**
 * Pantalla completa que confirma el resultado de una acción importante
 * (postular, publicar, verificarse, pre-registrarse). Un mensaje por pantalla.
 */
export function ResultScreen({
    variant,
    title,
    text,
    action,
    secondaryAction,
    focusTitle = true,
    className,
    ...rest
}: ResultScreenProps) {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const Icon = ICONS[variant];

    useEffect(() => {
        if (focusTitle) titleRef.current?.focus();
    }, [focusTitle]);

    return (
        <div className={cx('tl-result', `tl-result--${variant}`, className)} {...rest}>
            <div className="tl-result__main" role="status">
                <div className="tl-result__icon">
                    <Icon />
                </div>
                <h1 ref={titleRef} className="tl-result__title h1 tl-focus" tabIndex={-1}>
                    {title}
                </h1>
                <p className="tl-result__text">{text}</p>
            </div>
            <CtaBar>
                <ResultButton {...action} variant="primary" />
                {secondaryAction && <ResultButton {...secondaryAction} variant="ghost" />}
            </CtaBar>
        </div>
    );
}

function ResultButton({ label, ...rest }: ResultScreenAction & { variant: 'primary' | 'ghost' }) {
    return (
        <Button size="lg" block {...rest}>
            {label}
        </Button>
    );
}
