import { Fragment, useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { formatAmount, type PayUnit } from '../Amount';
import { ChipGroup, type ChipGroupOption } from '../ChipGroup';
import { cx } from '../cx';
import type { IconComponent } from '../icons';
import { MoneyField } from '../MoneyField';
import { Select } from '../Select';
import type { SheetPickerOption } from '../SheetPicker';
import { Skeleton, SkeletonGroup } from '../Skeleton';
import { Switch } from '../Switch';
import { FieldFoot, TextField } from '../TextField';

/**
 * - `edit`: onboarding, perfil y publicar («¿qué te sirve?», «¿qué necesitas?»).
 * - `filter`: filtros de Explorar: chips de elección múltiple, etiquetas cortas, sin «(opcional)».
 * - `read`: detalle (DET-01 Requisitos): `dl` con ícono, etiqueta y valor; lo vacío no aparece.
 */
export type DynamicFieldsMode = 'edit' | 'filter' | 'read';

interface FieldBase {
    /** Clave del `attribute_schemas` (`shift_system`). Nunca se muestra. */
    key: string;
    /** Etiqueta del `ui_schema` («Sistema de turno», «Dónde has trabajado»). */
    label: string;
    /** Etiqueta en filtros y en el detalle, si es otra («Dónde»). */
    shortLabel?: string;
    /** Marca «(opcional)» al editar. Solo lo opcional se marca. */
    optional?: boolean;
    /** Ayuda bajo el campo («Mínimo 12 horas por ley»). Los chips no llevan ayuda. */
    help?: string;
    /** Ícono del dato en el detalle: uno por tipo de dato (IconClock jornada, IconDocument credencial, IconLocation lugar). */
    icon?: IconComponent;
}

/** Chips (widget `chips` y `segmented`): un valor (`string`) o varios (`string[]`). */
export interface DynamicChipsField extends FieldBase {
    kind: 'chips';
    options: readonly ChipGroupOption[];
    /** Varias opciones (perfil). En filtros siempre son varias. */
    multiple?: boolean;
    /** Máximo con su aviso («Máximo 3 oficios. Quita uno para elegir otro.»), solo con `multiple`. */
    max?: { count: number; note: string };
}

/** Lista larga en una hoja con buscador (Select): un valor `string`. */
export interface DynamicSelectField extends FieldBase {
    kind: 'select';
    options: readonly SheetPickerOption[];
    /** «Elige la comuna del evento». */
    placeholder: string;
    searchPlaceholder?: string;
}

/** Texto de una línea: `string`. */
export interface DynamicTextField extends FieldBase {
    kind: 'text';
    placeholder?: string;
    maxLength?: number;
}

/** Número entero (widget `stepper`): `number`. */
export interface DynamicNumberField extends FieldBase {
    kind: 'number';
    placeholder?: string;
    /** Lo que sigue al número en el detalle («personas», «horas»). */
    suffix?: string;
}

/** Monto con unidad (MoneyField): `MoneyValue`. */
export interface DynamicMoneyField extends FieldBase {
    kind: 'money';
    /** Sueldos y tarifas: `true` líquido, `false` bruto. Se dice en el detalle. */
    net?: boolean;
    /** Unidades que se ofrecen; la primera es la de partida. Por defecto, todo el diccionario. */
    units?: readonly PayUnit[];
}

/** Sí o no (Switch): `boolean`. */
export interface DynamicSwitchField extends FieldBase {
    kind: 'switch';
}

/** Fecha (`AAAA-MM-DD`): `string`. */
export interface DynamicDateField extends FieldBase {
    kind: 'date';
    min?: string;
    max?: string;
}

/**
 * Pieza que trae la pantalla en `slots[key]`: el documento de una credencial
 * (MediaUploader) al editar, o su exigencia (Badge «Obligatoria») en el detalle.
 * En filtros no se dibuja.
 */
export interface DynamicSlotField extends FieldBase {
    kind: 'slot';
}

export type DynamicField =
    | DynamicChipsField
    | DynamicSelectField
    | DynamicTextField
    | DynamicNumberField
    | DynamicMoneyField
    | DynamicSwitchField
    | DynamicDateField
    | DynamicSlotField;

export interface MoneyValue {
    amount: number | null;
    unit: PayUnit;
}

export type DynamicValue = string | readonly string[] | number | boolean | MoneyValue | null;

/** Valores por clave, tal como se guardan en `attributes`. */
export type DynamicValues = Readonly<Record<string, DynamicValue | undefined>>;

export interface DynamicFieldsProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'children' | 'title'> {
    /** Rótulo del bloque, con el oficio o la materia: «Para guardia de seguridad». */
    title: string;
    /** Ícono del oficio (IconJobSecurity) o de la categoría de clase. */
    icon: IconComponent;
    /** Los campos del oficio, en el orden del schema. Lo que no aplica al oficio no viene. */
    fields: readonly DynamicField[];
    value: DynamicValues;
    /** Con todos los valores, al cambiar uno. No hace falta en `read`. */
    onChange?: (next: DynamicValues) => void;
    mode?: DynamicFieldsMode;
    /** Mensaje junto al control, por clave («Elige un sistema de turno», «Sube tu credencial SPD»). */
    errors?: Readonly<Partial<Record<string, string>>>;
    /** Piezas de los campos `slot`, por clave. */
    slots?: Readonly<Partial<Record<string, ReactNode>>>;
    /** Todos los controles, por ejemplo mientras se guarda el paso. */
    disabled?: boolean;
    /** Mientras llegan los campos del oficio: Skeleton de chips. */
    loading?: boolean;
    /** `false`: las hojas de Select y MoneyField se dibujan en su lugar (catálogo). */
    portal?: boolean;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

/** «2026-12-12» → «12 dic 2026». */
function formatDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    const month = m ? MONTHS[m - 1] : undefined;
    return y && month && d ? `${d} ${month} ${y}` : iso;
}

function asText(v: DynamicValue | undefined): string {
    return typeof v === 'string' ? v : '';
}

function asList(v: DynamicValue | undefined): readonly string[] {
    if (Array.isArray(v)) return v;
    return typeof v === 'string' && v !== '' ? [v] : [];
}

function asNumber(v: DynamicValue | undefined): number | null {
    return typeof v === 'number' ? v : null;
}

function asMoney(v: DynamicValue | undefined, field: DynamicMoneyField): MoneyValue {
    if (v !== null && typeof v === 'object' && !Array.isArray(v) && 'unit' in v) return v;
    return { amount: null, unit: field.units?.[0] ?? 'mes' };
}

/** El valor en palabras para el detalle; vacío si no hay dato. */
function readText(field: DynamicField, v: DynamicValue | undefined): string {
    switch (field.kind) {
        case 'chips':
            return asList(v)
                .map((x) => field.options.find((o) => o.value === x)?.label ?? x)
                .join(' · ');
        case 'select':
            return field.options.find((o) => o.value === v)?.label ?? '';
        case 'text':
            return asText(v);
        case 'number': {
            const n = asNumber(v);
            return n === null ? '' : `${n}${field.suffix ? ` ${field.suffix}` : ''}`;
        }
        case 'money': {
            const m = asMoney(v, field);
            if (m.amount === null && m.unit !== 'a_convenir') return '';
            return formatAmount({ value: m.amount, unit: m.unit, net: field.net, negotiableLabel: 'A convenir' });
        }
        case 'switch':
            return typeof v === 'boolean' ? (v ? 'Sí' : 'No') : '';
        case 'date':
            return asText(v) ? formatDate(asText(v)) : '';
        case 'slot':
            return '';
    }
}

/**
 * Los campos propios de cada oficio o materia (`attribute_schemas`), iguales
 * en onboarding, publicar, filtros y detalle: mismas etiquetas, mismo orden,
 * mismos íconos. Compone ChipGroup, Select, TextField, MoneyField y Switch.
 * El `widget: segmented` del schema se dibuja como chips de elección única.
 */
export function DynamicFields({
    title,
    icon: Icon,
    fields,
    value,
    onChange,
    mode = 'edit',
    errors,
    slots,
    disabled,
    loading,
    portal,
    className,
    ...rest
}: DynamicFieldsProps) {
    const headId = useId();
    const idBase = useId();
    const head = (
        <p className="tl-dyn__head overline" id={headId}>
            <Icon />
            {title}
        </p>
    );

    if (loading) {
        return (
            <SkeletonGroup className={cx('tl-dyn', className)} label={`Cargando los datos ${title.toLowerCase()}…`} {...rest}>
                {head}
                {[0, 1].map((i) => (
                    <div key={i} className="tl-chipgroup" aria-hidden="true">
                        <div className="tl-chipgroup__head">
                            <Skeleton shape="line" width={i ? 96 : 128} />
                        </div>
                        <div className="tl-chipgroup__chips">
                            <Skeleton shape="chip" width={64} />
                            <Skeleton shape="chip" width={56} />
                            <Skeleton shape="chip" width={72} />
                            <Skeleton shape="chip" width={96} />
                        </div>
                    </div>
                ))}
            </SkeletonGroup>
        );
    }

    if (mode === 'read') {
        const rows = fields.flatMap((field) => {
            const shown: ReactNode = field.kind === 'slot' ? slots?.[field.key] : readText(field, value[field.key]);
            return shown === undefined || shown === null || shown === '' ? [] : [{ field, shown }];
        });
        return (
            <div className={cx('tl-dyn', className)} role="group" aria-labelledby={headId} {...rest}>
                {head}
                <dl className="tl-dyn__read">
                    {rows.map(({ field, shown }) => {
                        const FieldIcon = field.icon;
                        const label = field.shortLabel ?? field.label;
                        return (
                            <Fragment key={field.key}>
                                <dt>
                                    {FieldIcon && <FieldIcon />}
                                    <span className="tl-vh">{label}</span>
                                </dt>
                                <dd>
                                    {/* La etiqueta visible repite el dt (que el lector ya dijo). */}
                                    <b aria-hidden="true">{label}</b>
                                    <span className="v">{shown}</span>
                                </dd>
                            </Fragment>
                        );
                    })}
                </dl>
            </div>
        );
    }

    const filter = mode === 'filter';
    const set = (key: string, next: DynamicValue) => onChange?.({ ...value, [key]: next });

    const control = (field: DynamicField): ReactNode => {
        const v = value[field.key];
        const error = errors?.[field.key];
        const label = filter ? (field.shortLabel ?? field.label) : field.label;
        const optional = !filter && field.optional;
        const id = `${idBase}-${field.key}`;
        switch (field.kind) {
            case 'chips': {
                const multiple = filter || field.multiple;
                const current = asList(v);
                const common = {
                    // ChipGroup no tiene «(opcional)» aparte: va en el texto de la etiqueta.
                    label: optional ? `${label} (opcional)` : label,
                    options: field.options,
                    value: current,
                    error,
                    disabled,
                    onChange: (next: string[]) => {
                        if (multiple) return set(field.key, next);
                        // Elección única: el chip tocado reemplaza al anterior; volver a tocarlo lo quita solo si es opcional.
                        const added = next.find((x) => !current.includes(x));
                        set(field.key, added ?? (field.optional ? null : (current[0] ?? null)));
                    },
                };
                return multiple && field.max && !filter ? (
                    <ChipGroup {...common} max={field.max.count} maxNote={field.max.note} />
                ) : (
                    <ChipGroup {...common} />
                );
            }
            case 'select':
                return (
                    <Select
                        id={id}
                        label={label}
                        optional={optional}
                        placeholder={field.placeholder}
                        searchPlaceholder={field.searchPlaceholder}
                        options={field.options}
                        value={asText(v) || null}
                        onChange={(next) => set(field.key, next)}
                        help={field.help}
                        error={error}
                        disabled={disabled}
                        portal={portal}
                    />
                );
            case 'text':
                return (
                    <TextField
                        id={id}
                        label={label}
                        optional={optional}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        value={asText(v)}
                        onChange={(e) => set(field.key, e.target.value)}
                        help={field.help}
                        error={error}
                        disabled={disabled}
                    />
                );
            case 'number': {
                const n = asNumber(v);
                return (
                    <TextField
                        id={id}
                        label={label}
                        optional={optional}
                        placeholder={field.placeholder}
                        inputMode="numeric"
                        value={n === null ? '' : String(n)}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                            set(field.key, digits === '' ? null : Number(digits));
                        }}
                        help={field.help}
                        error={error}
                        disabled={disabled}
                    />
                );
            }
            case 'money': {
                const m = asMoney(v, field);
                return (
                    <MoneyField
                        id={id}
                        label={label}
                        optional={optional}
                        value={m.amount}
                        onChange={(amount) => set(field.key, { amount, unit: m.unit })}
                        unit={m.unit}
                        onUnitChange={(unit) => set(field.key, { amount: unit === 'a_convenir' ? null : m.amount, unit })}
                        units={field.units}
                        help={field.help}
                        error={error}
                        disabled={disabled}
                        portal={portal}
                    />
                );
            }
            case 'switch':
                return (
                    <Switch
                        id={id}
                        label={label}
                        description={field.help}
                        checked={v === true}
                        onChange={(e) => set(field.key, e.target.checked)}
                        disabled={disabled}
                    />
                );
            case 'date':
                return (
                    <TextField
                        id={id}
                        type="date"
                        label={label}
                        optional={optional}
                        min={field.min}
                        max={field.max}
                        value={asText(v)}
                        onChange={(e) => set(field.key, e.target.value || null)}
                        help={field.help}
                        error={error}
                        disabled={disabled}
                    />
                );
            case 'slot': {
                // Etiqueta arriba, la pieza de la pantalla y, si hay, ayuda o error al pie (como un campo).
                const labelId = `${id}-l`;
                return (
                    <div className={cx('tl-field', error ? 'is-error' : undefined)} role="group" aria-labelledby={labelId}>
                        <span className="tl-field__label" id={labelId}>
                            {label}
                            {optional && (
                                <>
                                    {' '}
                                    <span className="tl-field__opt">(opcional)</span>
                                </>
                            )}
                        </span>
                        {slots?.[field.key]}
                        {(field.help || error) && <FieldFoot helpId={`${id}-h`} errorId={`${id}-e`} help={field.help} error={error} />}
                    </div>
                );
            }
        }
    };

    return (
        <div className={cx('tl-dyn', className)} role="group" aria-labelledby={headId} {...rest}>
            {head}
            {fields.map((field) =>
                filter && field.kind === 'slot' ? null : <Fragment key={field.key}>{control(field)}</Fragment>,
            )}
        </div>
    );
}
