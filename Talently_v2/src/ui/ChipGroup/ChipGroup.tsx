import { useId, useLayoutEffect, useRef, type ComponentPropsWithRef } from 'react';
import { cx } from '../cx';
import { IconAlert, type IconComponent } from '../icons';
import { Chip } from '../Chip';

export interface ChipGroupOption<T extends string = string> {
    value: T;
    /** Texto del chip («Garzón», «Estación Central»). */
    label: string;
    /** Ícono de categoría (chips `lead`, M9). */
    icon?: IconComponent;
}

interface ChipGroupBaseProps<T extends string>
    extends Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'children' | 'role'> {
    /** Etiqueta del grupo, 13/600 («Oficios»). Es también el nombre accesible del grupo. */
    label: string;
    /** Opciones en su orden fijo. Dependen del oficio o la materia. */
    options: readonly ChipGroupOption<T>[];
    /** Valores elegidos. */
    value: readonly T[];
    onChange: (next: T[]) => void;
    /**
     * `filter`: chips filter que se marcan con check.
     * `input`: lo elegido como chips input (con X) y lo demás como suggestion (con +).
     */
    mode?: 'filter' | 'input';
    /** Error del grupo al intentar continuar («Elige al menos 1 oficio»). */
    error?: string;
    /** Todo el grupo, por ejemplo mientras se guarda el paso. */
    disabled?: boolean;
}

export type ChipGroupProps<T extends string = string> = ChipGroupBaseProps<T> &
    (
        | {
              /** Máximo elegible: muestra el contador «2 de 3» y, al llegar, avisa en warning y deshabilita el resto. */
              max: number;
              /**
               * Aviso al llegar al máximo, que dice qué se elige y con su género:
               * «Máximo 3 oficios. Quita uno para elegir otro.», «Máximo 5
               * comunas. Quita una para elegir otra.». Obligatorio con `max`.
               */
              maxNote: string;
          }
        | { max?: undefined; maxNote?: undefined }
    );

/** El chip tocado en `mode="input"`, para devolverle el foco cuando cambia de forma. */
interface PendingFocus<T> {
    value: T;
    kind: 'added' | 'removed';
    /** Al quitar: la X que sigue (o la anterior), por si la sugerencia quedó deshabilitada. */
    fallback?: T;
}

/** Grupo de chips con etiqueta, contador y máximo («2 de 3»). Controlado. El límite es warning, nunca danger. */
export function ChipGroup<T extends string = string>({
    label,
    options,
    value,
    onChange,
    mode = 'filter',
    max,
    maxNote,
    error,
    disabled,
    className,
    ...rest
}: ChipGroupProps<T>) {
    const labelId = useId();
    const noteId = useId();
    const chipId = useId();
    const atMax = max !== undefined && value.length >= max;
    const note = error ?? (atMax ? maxNote : undefined);
    const idOf = (v: T) => `${chipId}-${v}`;

    // En `input`, un chip pasa de suggestion (button) a input (span + X) y al
    // revés: React cambia el elemento y el foco caería a <body>.
    const pendingFocus = useRef<PendingFocus<T> | null>(null);

    // Siempre en el orden de las opciones, no en el del toque.
    const set = (v: T, on: boolean) => {
        if (mode === 'input') {
            const chosenValues = options.map((o) => o.value).filter((x) => value.includes(x));
            const i = chosenValues.indexOf(v);
            pendingFocus.current = {
                value: v,
                kind: on ? 'added' : 'removed',
                fallback: on ? undefined : (chosenValues[i + 1] ?? chosenValues[i - 1]),
            };
        }
        onChange(options.map((o) => o.value).filter((x) => (x === v ? on : value.includes(x))));
    };

    useLayoutEffect(() => {
        const pending = pendingFocus.current;
        pendingFocus.current = null;
        if (!pending) return;
        const usable = (id: string) => {
            const el = document.getElementById(id);
            return el instanceof HTMLButtonElement && !el.disabled ? el : null;
        };
        // Tras agregar: la X del nuevo chip input. Tras quitar: la sugerencia en
        // que se convirtió o, si quedó deshabilitada, la X siguiente.
        const target =
            usable(`${chipId}-${pending.value}`) ??
            (pending.fallback !== undefined ? usable(`${chipId}-${pending.fallback}`) : null);
        target?.focus();
    }, [value, chipId]);

    const chosen = options.filter((o) => value.includes(o.value));
    const suggested = options.filter((o) => !value.includes(o.value));

    return (
        <div
            className={cx('tl-chipgroup', atMax && 'is-max', error ? 'is-error' : undefined, disabled && 'is-disabled', className)}
            role="group"
            aria-labelledby={labelId}
            aria-describedby={note ? noteId : undefined}
            {...rest}
        >
            <div className="tl-chipgroup__head">
                <span className="tl-chipgroup__label" id={labelId}>{label}</span>
                {max !== undefined && (
                    <span className="tl-chipgroup__count" aria-live="polite">
                        {value.length} de {max}
                    </span>
                )}
            </div>
            <div className="tl-chipgroup__chips">
                {mode === 'filter'
                    ? options.map((o) => {
                          const on = value.includes(o.value);
                          return (
                              <Chip
                                  key={o.value}
                                  variant={o.icon ? 'lead' : 'filter'}
                                  icon={o.icon}
                                  selected={on}
                                  disabled={disabled || (atMax && !on)}
                                  onClick={() => set(o.value, !on)}
                              >
                                  {o.label}
                              </Chip>
                          );
                      })
                    : [
                          // El id del chip input va en la X, que es el botón real.
                          ...chosen.map((o) => (
                              <Chip
                                  key={o.value}
                                  id={idOf(o.value)}
                                  variant="input"
                                  disabled={disabled}
                                  onRemove={() => set(o.value, false)}
                              >
                                  {o.label}
                              </Chip>
                          )),
                          ...suggested.map((o) => (
                              <Chip
                                  key={o.value}
                                  id={idOf(o.value)}
                                  variant="suggestion"
                                  disabled={disabled || atMax}
                                  onClick={() => set(o.value, true)}
                              >
                                  {o.label}
                              </Chip>
                          )),
                      ]}
            </div>
            {atMax && !error && (
                <div className="tl-chipgroup__note tl-chipgroup__note--max" id={noteId}>
                    <IconAlert size={16} />
                    <span>{note}</span>
                </div>
            )}
            {error && (
                <div className="tl-chipgroup__note tl-chipgroup__note--error" id={noteId}>
                    <IconAlert size={16} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
