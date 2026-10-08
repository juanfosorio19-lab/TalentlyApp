import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../cx';
import { IconAlert } from '../icons';

export interface ChoiceGroupProps extends Omit<ComponentPropsWithRef<'fieldset'>, 'children'> {
    /** Etiqueta del grupo, 13/600 («Disponible desde», «Jornada»). */
    legend: ReactNode;
    /** La etiqueta solo para lectores de pantalla (cuando la pantalla ya la dice en un título). */
    legendHidden?: boolean;
    /** Elección única: `role="radiogroup"`. */
    radio?: boolean;
    /** Mensaje del grupo con ícono alerta («Elige cuándo puedes empezar»): pone `is-error` y anillos en danger. */
    error?: ReactNode;
    /**
     * Id del mensaje de error; por defecto uno único. Pásalo cuando cada
     * casilla del grupo lleve `aria-invalid`, para darle también
     * `aria-describedby` con este id y que el lector diga por qué.
     */
    errorId?: string;
    children: ReactNode;
}

/**
 * Grupo `fieldset.tl-group` de filas Checkbox, Radio o Switch, con su
 * etiqueta y el error del grupo al pie.
 */
export function ChoiceGroup({ legend, legendHidden, radio, error, errorId: errorIdProp, className, children, ...rest }: ChoiceGroupProps) {
    const autoErrorId = useId();
    const errorId = errorIdProp ?? autoErrorId;
    return (
        <fieldset
            className={cx('tl-group', error ? 'is-error' : undefined, className)}
            role={radio ? 'radiogroup' : undefined}
            aria-invalid={radio && error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            {...rest}
        >
            <legend className={legendHidden ? 'tl-vh' : 'tl-group__label'}>{legend}</legend>
            {children}
            {error && (
                <div className="tl-field__foot">
                    <span className="tl-field__error" id={errorId}>
                        <IconAlert size={16} />
                        <span>{error}</span>
                    </span>
                </div>
            )}
        </fieldset>
    );
}
