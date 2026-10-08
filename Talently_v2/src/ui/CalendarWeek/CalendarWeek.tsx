import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../cx';
import { IconBook, IconClock, IconOffers, IconTool, type IconComponent } from '../icons';
import { Badge, type BadgeStatus } from '../Badge';
import { ErrorState } from '../ErrorState';
import { Stack } from '../Layout';
import { SegmentedControl } from '../SegmentedControl';
import { SkeletonList } from '../Skeleton';
import {
    addDays,
    dayOfMonth,
    formatDayLong,
    formatDayRange,
    formatDayShort,
    weekdayShort,
    type IsoDate,
} from './dates';

/** De qué publicación viene el compromiso: define su ícono (M4). */
export type AgendaEventKind = 'turno' | 'entrevista' | 'clase' | 'visita';

const KIND_ICON: Record<AgendaEventKind, IconComponent> = {
    turno: IconClock,
    entrevista: IconOffers,
    clase: IconBook, // desde F2
    visita: IconTool, // desde F3
};

/** Un compromiso de la Agenda: solo lo real (Confirmado) y lo pendiente con su estado (Postulado). */
export interface AgendaEventData {
    id: string;
    /** Día en que empieza. */
    date: IsoDate;
    /** «19:00». */
    start: string;
    /** «01:00»: si es menor que el inicio, termina al día siguiente. */
    end: string;
    kind: AgendaEventKind;
    /** Tipo y oficio o materia: «Turno · Garzón», «Clase · PAES M1». */
    title: string;
    /** Organización o persona: «Banquetería Rosa SpA», «Josefa Morales». */
    who?: string;
    /** Comuna u «Online». */
    where?: string;
    /** Estado del diccionario de Badge. */
    status: BadgeStatus;
}

export interface AgendaEventProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
    event: AgendaEventData;
}

/**
 * Un compromiso (`.tl-event`): hora de inicio y fin, ícono del tipo, título,
 * quién y dónde, y su Badge. El mismo en la Agenda y en Inicio («Hoy en tu
 * agenda», «Tus próximas clases»), para que un turno se vea igual en ambos.
 */
export function AgendaEvent({ event: e, type = 'button', className, ...rest }: AgendaEventProps) {
    const Icon = KIND_ICON[e.kind];
    const sub = [e.who, e.where].filter(Boolean).join(' · ');
    return (
        <button
            type={type}
            // `.tl-event` no trae foco propio en bundle.css: usa el foco oficial (`tl-focus`).
            className={cx('tl-event tl-focus', className)}
            aria-label={`${e.title}, ${formatDayShort(e.date)} de ${e.start} a ${e.end}${sub ? `, ${sub}` : ''}, ${e.status}`}
            {...rest}
        >
            <span className="tl-event__time">
                {e.start}
                <span>{e.end}</span>
            </span>
            <span className="tl-event__body">
                <span className="tl-event__title">
                    <Icon />
                    {e.title}
                </span>
                {sub && <span className="tl-event__sub">{sub}</span>}
                <Badge status={e.status} />
            </span>
        </button>
    );
}

export type CalendarView = 'day' | 'week';

const VIEWS = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
] as const;

export interface CalendarWeekProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
    /** Semana: tira de 7 días + agenda en lista. Día: horas de 48 px con los bloques del día. */
    view: CalendarView;
    onViewChange: (view: CalendarView) => void;
    /**
     * Lunes de la semana que se muestra. El sistema aún no tiene cabecera para
     * cambiar de semana (brecha pedida a Claude Design): por ahora la Agenda
     * muestra la semana de hoy.
     */
    weekStart: IsoDate;
    /** Hoy: anillo `color-primary-text` y `aria-current="date"`. */
    today: IsoDate;
    /**
     * Día que muestra la vista Día. Si no cae en la semana, se muestra hoy (si
     * está en ella) o el lunes: nunca un día que no está a la vista.
     */
    day: IsoDate;
    /** Tocar un día lo abre en la vista Día. */
    onDayChange: (day: IsoDate) => void;
    /** Compromisos de la semana (los de otros días se ignoran). */
    events: readonly AgendaEventData[];
    /** Abre el detalle del compromiso (vista Semana, y los que se cruzan en la vista Día). */
    onEventClick: (event: AgendaEventData) => void;
    /** La lista carga con Skeleton de lista. */
    loading?: boolean;
    /** La agenda no cargó: ErrorState «No pudimos cargar tu agenda» con «Reintentar». */
    error?: { onRetry: () => void; retrying?: boolean };
    /** Semana sin nada: el EmptyState de la Agenda («Aún no tienes nada agendado»). */
    empty?: ReactNode;
    /** Solo para el catálogo: clases que fuerzan estados en un día (`{ '2026-12-09': 'is-pressed' }`). */
    dayClassName?: Partial<Record<IsoDate, string>>;
}

const HOUR_PX = 48;

const minutesOf = (hhmm: string) => {
    const [h = 0, m = 0] = hhmm.split(':').map(Number);
    return h * 60 + m;
};
const pad = (n: number) => String(n).padStart(2, '0');
const byStart = (a: AgendaEventData, b: AgendaEventData) => minutesOf(a.start) - minutesOf(b.start);

export interface WeekStripProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'onSelect'> {
    /** Lunes de la semana. */
    weekStart: IsoDate;
    /** Hoy: anillo `color-primary-text` y `aria-current="date"`. */
    today: IsoDate;
    /** Día elegido (vista Día), en `color-primary-subtle`. En la vista Semana, ninguno. */
    selected: IsoDate | null;
    /** Compromisos de cada día, de lunes a domingo: con 1 o más, el punto. */
    counts: readonly number[];
    onSelect: (day: IsoDate) => void;
    /** Solo para el catálogo: clases que fuerzan estados en un día (`{ '2026-12-09': 'is-pressed' }`). */
    dayClassName?: Partial<Record<IsoDate, string>>;
}

/** Tira de 7 días (`.tl-week`): día de la semana, número y un punto en los días con algo. */
export function WeekStrip({ weekStart, today, selected, counts, onSelect, dayClassName, className, ...rest }: WeekStripProps) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    return (
        <div
            className={cx('tl-week', className)}
            role="group"
            aria-label={`Semana del ${formatDayRange(weekStart, week[6] ?? weekStart)}`}
            {...rest}
        >
            {week.map((d, i) => {
                const count = counts[i] ?? 0;
                const isToday = d === today;
                const isSelected = d === selected;
                return (
                    <button
                        key={d}
                        type="button"
                        // Hoy y elegido solo tienen selector de clase en bundle.css.
                        className={cx('tl-week__day', isToday && 'is-today', isSelected && 'is-selected', dayClassName?.[d])}
                        aria-pressed={isSelected}
                        aria-current={isToday ? 'date' : undefined}
                        aria-label={`${formatDayLong(d)}${isToday ? ', hoy' : ''}${
                            count > 0 ? `, ${count} ${count === 1 ? 'compromiso' : 'compromisos'}` : ''
                        }`}
                        onClick={() => onSelect(d)}
                    >
                        <span className="tl-week__wd">{weekdayShort(d)}</span>
                        <span className="tl-week__n">{dayOfMonth(d)}</span>
                        <span className={cx('tl-week__dot', count === 0 && 'is-empty')} />
                    </button>
                );
            })}
        </div>
    );
}

/**
 * La Agenda de Actividad (ACT-01) en dos vistas, que se cambian con el
 * SegmentedControl «Día · Semana». Una grilla de 7 columnas con horas sería
 * ilegible a 390: la semana es una tira de días con punto y la agenda en
 * lista; el día, horas de 48 px con bloques.
 */
export function CalendarWeek({
    view,
    onViewChange,
    weekStart,
    today,
    day,
    onDayChange,
    events,
    onEventClick,
    loading,
    error,
    empty,
    dayClassName,
    className,
    ...rest
}: CalendarWeekProps) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    // El día de la vista Día siempre está en la tira (si cambia la semana y no el día).
    const shownDay = week.includes(day) ? day : week.includes(today) ? today : weekStart;
    const eventsOf = (d: IsoDate) => events.filter((e) => e.date === d).sort(byStart);
    const weekHasEvents = week.some((d) => eventsOf(d).length > 0);

    let content: ReactNode;
    if (error) {
        content = <ErrorState title="No pudimos cargar tu agenda" onRetry={error.onRetry} retrying={error.retrying} />;
    } else if (loading) {
        content = <SkeletonList rows={3} avatar="square" label="Cargando tu agenda…" />;
    } else if (view === 'week') {
        content = weekHasEvents ? (
            <div>
                {week.map((d) => {
                    const list = eventsOf(d);
                    if (list.length === 0) return null;
                    return [
                        <p key={d} className="tl-agenda__day overline">{formatDayShort(d)}</p>,
                        ...list.map((e) => (
                            <AgendaEvent key={e.id} event={e} onClick={() => onEventClick(e)} />
                        )),
                    ];
                })}
            </div>
        ) : (
            (empty ?? <p className="tl-empty__text">Sin turnos esta semana</p>)
        );
    } else {
        content = <DayView events={eventsOf(shownDay)} onEventClick={onEventClick} />;
    }

    // En la vista Semana, el primer `.tl-agenda__day` ya trae su margen de 24;
    // en el resto, la separación de 24 bajo la tira la pone la pila.
    const listOwnsSpacing = view === 'week' && weekHasEvents && !loading && !error;

    const header = (
        <Stack gap={4}>
            <SegmentedControl
                options={VIEWS}
                value={view}
                onChange={onViewChange}
                aria-label="Vista de la agenda"
            />
            <WeekStrip
                weekStart={weekStart}
                today={today}
                selected={view === 'day' ? shownDay : null}
                counts={week.map((d) => eventsOf(d).length)}
                onSelect={(d) => {
                    onDayChange(d);
                    if (view !== 'day') onViewChange('day');
                }}
                dayClassName={dayClassName}
            />
        </Stack>
    );

    // Siempre el mismo elemento raíz (solo cambian las clases de la pila): si
    // cambiara de tipo, React volvería a montar la cabecera al cambiar de vista
    // y el foco del día o del segmento que se tocó se iría al <body>.
    return (
        <div className={cx(!listOwnsSpacing && 'tl-stack tl-stack--6', className)} {...rest}>
            {header}
            {content}
        </div>
    );
}

/**
 * Vista Día: horas de 48 px con divisores y los bloques del día (`.tl-dayview`).
 * bundle.css no tiene columnas para bloques que se cruzan (brecha): los que se
 * cruzan con uno anterior van debajo de la grilla, como compromisos, para que
 * ninguno quede tapado.
 */
function DayView({
    events,
    onEventClick,
}: {
    events: readonly AgendaEventData[];
    onEventClick: (event: AgendaEventData) => void;
}) {
    if (events.length === 0) return <p className="tl-empty__text">Sin turnos este día</p>;

    // Si termina antes de empezar, cruza la medianoche.
    const span = events.map((e) => {
        const from = minutesOf(e.start);
        const to = minutesOf(e.end);
        return { e, from, to: to <= from ? to + 24 * 60 : to };
    });
    const inGrid: typeof span = [];
    const crossing: AgendaEventData[] = [];
    let gridEnd = -1;
    for (const s of span) {
        if (s.from >= gridEnd) {
            inGrid.push(s);
            gridEnd = s.to;
        } else {
            crossing.push(s.e);
        }
    }
    // De 2 horas antes del primero a 1 después del último, aunque termine al otro día (máximo 48 + 1).
    const first = Math.max(0, Math.floor(Math.min(...inGrid.map((s) => s.from)) / 60) - 2);
    const last = Math.ceil(Math.max(...inGrid.map((s) => s.to)) / 60) + 1;
    const hours = Array.from({ length: last - first + 1 }, (_, i) => first + i);

    const grid = (
        <div className="tl-dayview">
            {hours.flatMap((h) => [
                <span key={`h${h}`} className="tl-dayview__hour">{pad(h % 24)}:00</span>,
                <span key={`s${h}`} className="tl-dayview__slot" />,
            ])}
            {inGrid.map(({ e, from, to }) => {
                const Icon = KIND_ICON[e.kind];
                return (
                    <div
                        key={e.id}
                        className="tl-dayview__event"
                        // Posición y alto calculados: 48 px por hora desde la primera hora visible.
                        style={{ top: ((from - first * 60) / 60) * HOUR_PX, height: ((to - from) / 60) * HOUR_PX }}
                    >
                        <span className="tl-dayview__title">
                            <Icon size={16} />
                            {e.title}
                        </span>
                        <span>
                            {e.start}–{e.end}
                            {e.who ? ` · ${e.who}` : ''}
                        </span>
                        {/* El envoltorio deja la Badge a su ancho: el bloque es una columna flex que la estiraría. */}
                        <span>
                            <Badge status={e.status} />
                        </span>
                    </div>
                );
            })}
        </div>
    );
    if (crossing.length === 0) return grid;
    return (
        <div>
            {grid}
            <p className="tl-agenda__day overline">También en ese horario</p>
            {crossing.map((e) => (
                <AgendaEvent key={e.id} event={e} onClick={() => onEventClick(e)} />
            ))}
        </div>
    );
}
