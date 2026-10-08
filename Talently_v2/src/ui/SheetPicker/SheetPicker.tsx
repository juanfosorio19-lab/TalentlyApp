import {
    useLayoutEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    type RefObject,
} from 'react';
import { BottomSheet } from '../BottomSheet';
import { Button } from '../Button';
import { CheckboxGroup } from '../Checkbox';
import { IconSearch, type IconComponent } from '../icons';
import { RadioGroup } from '../Radio';
import { SearchField } from '../SearchField';

export interface SheetPickerOption<T extends string = string> {
    value: T;
    /** Nombre tal como se muestra y se busca («Ñuñoa», «Garzón o garzona», «al mes»). */
    label: string;
    /** Línea de apoyo bajo el nombre. No se busca. */
    description?: ReactNode;
    /** Ícono del set antes del nombre (la categoría de un oficio). */
    icon?: IconComponent;
    /**
     * Sinónimos de búsqueda: «nana» encuentra «Asesor/a del hogar». Nunca se
     * muestran en la interfaz.
     */
    keywords?: readonly string[];
}

interface SheetPickerBaseProps<T extends string> {
    open: boolean;
    /** Cerrar, velo, asa, Escape y atrás de Android; también tras elegir en elección única. */
    onClose: () => void;
    /** Título H2 de la hoja («Comuna», «Oficio», «Unidad»). Es también el nombre de la lista. */
    title: ReactNode;
    /** Opciones en su orden fijo; el buscador las filtra sin reordenarlas. */
    options: readonly SheetPickerOption<T>[];
    /** Buscador fijo bajo el título. Por defecto, sí. */
    searchable?: boolean;
    /** Placeholder del buscador («Buscar comuna»). Por defecto «Buscar». */
    searchPlaceholder?: string;
    /** Rótulo sobre la lista completa («Región Metropolitana · 52 comunas»). Al buscar, dice cuántos resultados hay. */
    groupLabel?: string;
    /** Ícono del «sin resultados» (IconLocation en comunas). */
    emptyIcon?: IconComponent;
    /** Segunda línea del «sin resultados»: qué probar («Revisa cómo lo escribiste o busca solo el nombre de la comuna.»). */
    emptyText?: ReactNode;
    /** Texto ya escrito al abrir. Solo para el catálogo (búsqueda y «sin resultados»). */
    defaultQuery?: string;
    /** `false`: se dibuja en su lugar (catálogo, marcos de 390) en vez de en `document.body`. */
    portal?: boolean;
    /** `false`: solo para mostrarla abierta en el catálogo (no toma el foco ni entra en la pila de capas). */
    modal?: boolean;
    className?: string;
}

export interface SheetPickerSingleProps<T extends string = string> extends SheetPickerBaseProps<T> {
    multiple?: false;
    /** Opción elegida; `null` si aún no hay. */
    value: T | null;
    /** Al elegir; después la hoja se cierra sola. */
    onChange: (next: T) => void;
}

export interface SheetPickerMultipleProps<T extends string = string> extends SheetPickerBaseProps<T> {
    /** Elección múltiple (oficios, asignaturas): casillas, contador y pie con «Listo». */
    multiple: true;
    /** Valores elegidos, en el orden de `options`. */
    value: readonly T[];
    /** En cada toque; la hoja sigue abierta hasta «Listo». */
    onChange: (next: T[]) => void;
    /** Máximo elegible: muestra «2 de 3» y, al llegar, deshabilita el resto. */
    max?: number;
    /** Etiqueta del botón del pie. Por defecto «Listo». */
    doneLabel?: string;
}

export type SheetPickerProps<T extends string = string> = SheetPickerSingleProps<T> | SheetPickerMultipleProps<T>;

/** Minúsculas y sin tildes, como compara el buscador («Ñuñoa» → «nunoa»). */
function fold(text: string): string {
    return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Lo escrito, plegado y con los espacios de más quitados. */
function foldQuery(text: string): string {
    return fold(text).replace(/\s+/g, ' ').trim();
}

/**
 * El nombre con la coincidencia en negrita, o `null` si no coincide. Compara
 * sin tildes ni mayúsculas, pero resalta las letras originales («la» resalta
 * «La» en «La Florida» y «ña» resalta «ña» en «Peñalolén» al escribir «na»).
 */
function highlight(label: string, query: string): ReactNode | null {
    if (!query) return label;
    let folded = '';
    // Para cada letra plegada, dónde empieza y termina su letra original.
    const from: number[] = [];
    const to: number[] = [];
    let i = 0;
    for (const ch of label) {
        const f = fold(ch);
        for (let k = 0; k < f.length; k++) {
            from.push(i);
            to.push(i + ch.length);
        }
        folded += f;
        i += ch.length;
    }
    const at = folded.indexOf(query);
    if (at === -1) return null;
    const start = from[at] ?? 0;
    const end = to[at + query.length - 1] ?? label.length;
    return (
        <>
            {label.slice(0, start)}
            <b>{label.slice(start, end)}</b>
            {label.slice(end)}
        </>
    );
}

interface Match<T extends string> {
    option: SheetPickerOption<T>;
    text: ReactNode;
}

/** Filtra por nombre y por sinónimos, sin cambiar el orden. */
function search<T extends string>(options: readonly SheetPickerOption<T>[], query: string): Match<T>[] {
    return options.flatMap((option) => {
        const text = highlight(option.label, query);
        if (text !== null) return [{ option, text }];
        if (option.keywords?.some((k) => foldQuery(k).includes(query))) return [{ option, text: option.label }];
        return [];
    });
}

/** Contenido de la fila: el nombre (con su coincidencia) y, si hay, el ícono antes. */
function rowLabel<T extends string>({ option, text }: Match<T>): ReactNode {
    const Icon = option.icon;
    if (!Icon) return text;
    // tl-choice no tiene ranura de ícono: el ícono va en fila con el nombre (Layout).
    return (
        <span className="tl-stack tl-stack--row tl-stack--3">
            <Icon />
            <span>{text}</span>
        </span>
    );
}

/**
 * Hoja inferior para elegir de una lista larga (comuna, oficio, materia,
 * unidad): BottomSheet con SearchField fijo arriba y filas Radio a la derecha.
 * En elección única, elegir (toque, Espacio o Enter) cierra la hoja; las
 * flechas solo recorren la lista sin cambiar el valor. En múltiple, cierra «Listo».
 *
 * Brechas de bundle.css (no se escriben aquí):
 * - Fila presionada y con foco: el sistema pide capa al 8 % sobre toda la fila
 *   y el anillo de foco en la fila completa (decisiones.md, «Presionado»;
 *   preview `.rowstate.is-pressed`, `.strip.rf`). bundle.css solo tiene el halo
 *   y el anillo del círculo (`.tl-choice:active .tl-radio__box::before`,
 *   `input:focus-visible + .tl-radio__box`). Falta, por ejemplo,
 *   `.tl-choice--row:active::before` al 8 % y `.tl-choice--row:has(input:focus-visible)`.
 * - «Sin resultados»: el preview usa un bloque compacto propio (ícono suelto de
 *   40 en `color-text-3`, sin el círculo de 72 de EmptyState, y Button ghost sm).
 *   Se arma con las clases `tl-empty*` que hay; falta el color `color-text-3`
 *   del ícono y el espaciado del preview (una variante compacta de `tl-empty`).
 */
export function SheetPicker<T extends string = string>(props: SheetPickerProps<T>) {
    const {
        open,
        onClose,
        title,
        searchable = true,
        searchPlaceholder = 'Buscar',
        groupLabel,
        emptyIcon = IconSearch,
        emptyText = 'Revisa cómo lo escribiste.',
        defaultQuery = '',
        portal,
        modal,
        className,
    } = props;
    const searchRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState(defaultQuery);
    // Cada vez que se abre, la búsqueda parte de cero (estado derivado durante el render).
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) setQuery(defaultQuery);
    }

    const q = searchable ? foldQuery(query) : '';
    const clearSearch = () => {
        setQuery('');
        searchRef.current?.focus();
    };

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={title}
            portal={portal}
            modal={modal}
            className={className}
            search={
                searchable ? (
                    <SearchField
                        ref={searchRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                    />
                ) : undefined
            }
            footer={props.multiple ? <Button onClick={onClose}>{props.doneLabel ?? 'Listo'}</Button> : undefined}
        >
            <PickerList
                picker={props}
                query={q}
                rawQuery={query.trim()}
                groupLabel={groupLabel}
                emptyIcon={emptyIcon}
                emptyText={emptyText}
                onClearSearch={clearSearch}
            />
        </BottomSheet>
    );
}

interface PickerListProps<T extends string> {
    picker: SheetPickerProps<T>;
    /** Búsqueda ya plegada. */
    query: string;
    /** Lo escrito, para el título del «sin resultados». */
    rawQuery: string;
    groupLabel?: string;
    emptyIcon: IconComponent;
    emptyText: ReactNode;
    onClearSearch: () => void;
}

/** Desplaza el cuerpo de la hoja hasta la (primera) opción elegida, con una fila de contexto arriba. */
function useScrollToChosen(groupRef: RefObject<HTMLElement | null>) {
    // Se monta al abrir la hoja (BottomSheet monta su contenido en cada apertura).
    useLayoutEffect(() => {
        const group = groupRef.current;
        const row = group?.querySelector('input:checked')?.closest('.tl-choice');
        const body = group?.closest('.tl-sheet__body');
        if (!(row instanceof HTMLElement) || !(body instanceof HTMLElement)) return;
        const r = row.getBoundingClientRect();
        const b = body.getBoundingClientRect();
        body.scrollTop += r.top - b.top - r.height;
    }, [groupRef]);
}

/** «Sin resultados» del preview: ícono suelto, título, qué probar y «Borrar búsqueda» (ghost sm). */
function NoResults({
    icon: Icon,
    rawQuery,
    text,
    onClearSearch,
}: {
    icon: IconComponent;
    rawQuery: string;
    text: ReactNode;
    onClearSearch: () => void;
}) {
    return (
        <div className="tl-empty">
            <div className="tl-stack tl-stack--3 tl-stack--center">
                <Icon size={40} />
                <h3 className="tl-empty__title h3">No encontramos «{rawQuery}»</h3>
            </div>
            <p className="tl-empty__text">{text}</p>
            <Button variant="ghost" size="sm" onClick={onClearSearch}>
                Borrar búsqueda
            </Button>
        </div>
    );
}

function PickerList<T extends string>({
    picker,
    query,
    rawQuery,
    groupLabel,
    emptyIcon,
    emptyText,
    onClearSearch,
}: PickerListProps<T>) {
    const groupRef = useRef<HTMLFieldSetElement>(null);
    // Si el cambio que viene llega por una flecha: el radio nativo se marca al
    // moverse, pero eso solo recorre la lista (ni elige ni cierra).
    const arrow = useRef(false);
    useScrollToChosen(groupRef);

    const matches = search(picker.options, query);
    const none = query !== '' && matches.length === 0;
    const chosenCount = picker.multiple ? picker.value.length : 0;
    const counter = picker.multiple && picker.max !== undefined ? `${chosenCount} de ${picker.max}` : undefined;
    const results = query ? `${matches.length} ${matches.length === 1 ? 'resultado' : 'resultados'}` : undefined;
    const head = [results ?? groupLabel, counter].filter(Boolean).join(' · ');
    // Región viva siempre presente (aunque no haya rótulo visible): dice cuántos
    // resultados hay al escribir, «Sin resultados» y el contador «2 de 3».
    const live = [none ? `Sin resultados para «${rawQuery}»` : results, counter].filter(Boolean).join(' · ');

    let list: ReactNode = null;
    if (none) {
        list = <NoResults icon={emptyIcon} rawQuery={rawQuery} text={emptyText} onClearSearch={onClearSearch} />;
    } else if (picker.multiple) {
        const { value, onChange, max } = picker;
        const atMax = max !== undefined && value.length >= max;
        const visible = new Set<T>(matches.map((m) => m.option.value));
        list = (
            <CheckboxGroup<T>
                ref={groupRef}
                legend={picker.title}
                legendHidden
                options={matches.map((m) => ({
                    value: m.option.value,
                    label: rowLabel(m),
                    description: m.option.description,
                    disabled: atMax && !value.includes(m.option.value),
                    className: 'tl-choice--row',
                }))}
                value={value}
                // CheckboxGroup solo conoce las filas visibles: lo elegido que la búsqueda oculta se conserva.
                onChange={(next) =>
                    onChange(
                        picker.options
                            .map((o) => o.value)
                            .filter((v) => (visible.has(v) ? next.includes(v) : value.includes(v))),
                    )
                }
            />
        );
    } else {
        const { value, onChange, onClose, options } = picker;
        // El grupo es controlado: con flechas el foco avanza, pero el radio
        // vuelve a la opción elegida porque no se llama a onChange.
        const pick = (next: T) => {
            if (arrow.current) return;
            if (next !== value) onChange(next);
        };
        const onKeyDown = (e: KeyboardEvent<HTMLFieldSetElement>) => {
            const target = e.target;
            if (e.key === 'Enter' && target instanceof HTMLInputElement && target.type === 'radio') {
                // Enter elige la fila con foco y cierra, como un toque.
                const option = options.find((o) => o.value === target.value);
                e.preventDefault();
                arrow.current = false;
                if (option) pick(option.value);
                onClose();
                return;
            }
            arrow.current = e.key.startsWith('Arrow');
        };
        // El change (y el click) de la flecha llegan antes de soltarla.
        const onKeyUp = () => {
            arrow.current = false;
        };
        // Tocar una fila (también la ya elegida) o marcarla con Espacio cierra la hoja.
        const onClick = (e: MouseEvent<HTMLFieldSetElement>) => {
            const target = e.target;
            if (target instanceof HTMLInputElement && target.type === 'radio' && !arrow.current) onClose();
        };
        list = (
            <RadioGroup<T>
                ref={groupRef}
                legend={picker.title}
                legendHidden
                variant="row"
                options={matches.map((m) => ({ value: m.option.value, label: rowLabel(m), description: m.option.description }))}
                value={value}
                onChange={pick}
                onPointerDown={onKeyUp}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                onClick={onClick}
            />
        );
    }

    return (
        <>
            <p className="tl-vh" aria-live="polite">
                {live}
            </p>
            {head && !none && (
                // Al buscar, repite lo que ya dijo la región viva.
                <p className="tl-sheet__group overline" aria-hidden={query ? true : undefined}>
                    {head}
                </p>
            )}
            {list}
        </>
    );
}
