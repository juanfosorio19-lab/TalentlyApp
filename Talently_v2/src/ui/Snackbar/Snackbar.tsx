import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Button } from '../Button/Button';
import { cx } from '../cx';
import { IconAlert, IconCheck, IconInfo } from '../icons';

export type SnackbarTone = 'info' | 'success' | 'error';

/**
 * Dónde va: sobre la TabBar (por defecto); `no-tabbar` en una pantalla apilada
 * sin TabBar ni CTA fijo; `static` dentro de `.tl-ctabar` o sobre
 * `.tl-sheet__foot`, justo encima del botón; `web` en el backoffice.
 */
export type SnackbarPlacement = 'tabbar' | 'no-tabbar' | 'static' | 'web';

export interface SnackbarAction {
    /** «Deshacer» o «Reintentar». */
    label: string;
    onAction: () => void;
    /** Solo para forzar estados en el catálogo (`is-pressed`, `is-focus`). */
    className?: string;
}

export interface SnackbarProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'role'> {
    /** Una o dos líneas, humano: «Publicación pausada», «No pudimos guardar. Revisa tu conexión e intenta de nuevo.». */
    message: ReactNode;
    tone?: SnackbarTone;
    /** Sin acción es un Toast. */
    action?: SnackbarAction;
    placement?: SnackbarPlacement;
    /**
     * `true` (por defecto): el propio aviso es la región viva (`role="status"`
     * o `"alert"`). `SnackbarProvider` pasa `false` porque anuncia desde
     * regiones que ya estaban montadas, y así no se lee dos veces.
     */
    announce?: boolean;
}

const TONE_ICON = { info: IconInfo, success: IconCheck, error: IconAlert } as const;

/**
 * Respuesta temporal a una acción, de a uno. En la app no se dibuja suelto:
 * se pide con `useSnackbar().show(…)`, que maneja el tiempo (4 s sin acción,
 * 8 s con acción) y el reemplazo.
 */
export function Snackbar({ message, tone = 'info', action, placement = 'tabbar', announce = true, className, ...rest }: SnackbarProps) {
    const Icon = TONE_ICON[tone];
    const alert = tone === 'error';
    return (
        <div
            className={cx(
                'tl-snackbar',
                tone !== 'info' && `tl-snackbar--${tone}`,
                placement !== 'tabbar' && `tl-snackbar--${placement}`,
                className,
            )}
            role={announce ? (alert ? 'alert' : 'status') : undefined}
            aria-live={announce ? (alert ? 'assertive' : 'polite') : undefined}
            aria-atomic={announce || undefined}
            {...rest}
        >
            <span className="tl-snackbar__icon">
                <Icon />
            </span>
            <span className="tl-snackbar__text">{message}</span>
            {action && (
                <Button variant="ghost" size="sm" className={action.className} onClick={action.onAction}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}

export type ToastProps = Omit<SnackbarProps, 'action'>;

/** Toast = Snackbar sin acción (se va a los 4 s). */
export function Toast(props: ToastProps) {
    return <Snackbar {...props} />;
}
