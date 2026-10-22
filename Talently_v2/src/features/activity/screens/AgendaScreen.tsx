// ACT-01 · Actividad · Agenda (spec §5.2 y §5.4): vista Semana o Día con
// todo lo que tiene fecha (turnos confirmados, entrevistas y los turnos
// pendientes con su estado; la organización ve sus turnos con los cupos
// cubiertos). Lee las postulaciones de la sesión (useApplications), así un
// turno cancelado en TUR-01 o una postulación nueva se ven igual que en ACT-02
// e Inicio. La vista y el día van en la URL (?seg=agenda&vista=dia&dia=…):
// atrás y la memoria de la pestaña vuelven a lo mismo. Un día o una vista que
// no aplican se corrigen también en la URL (replace), como ?seg en
// ActivityScreen: la memoria de la pestaña nunca guarda un día falso.
//
// Se arma con las piezas de CalendarWeek (SegmentedControl «Día · Semana»,
// WeekStrip y AgendaEvent) porque CalendarWeek aún no admite un compromiso
// sin hora de término (las entrevistas), su vista Día no abre el compromiso al
// tocarlo y su texto vacío dice siempre «Sin turnos este día» (pedido en
// requests). Así cada compromiso se toca igual en las dos vistas. CalendarWeek
// aún no cambia de semana: lo que viene después va en «Más adelante».
import { Fragment, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '../../../ui/Badge';
import { AgendaEvent, WeekStrip, addDays, formatDayShort, type CalendarView, type IsoDate } from '../../../ui/CalendarWeek';
import { cx } from '../../../ui/cx';
import { EmptyState } from '../../../ui/EmptyState';
import { IconCalendar, IconClock, IconOffers } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { ListItem } from '../../../ui/ListItem';
import { SegmentedControl } from '../../../ui/SegmentedControl';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { useApplications } from '../../demo/sessionStore';
import { targetPath } from '../../demo/targets';
import { ListGroup } from '../components/ListGroup';
import { copy } from '../copy';
import {
    TODAY,
    WEEK_END,
    WEEK_START,
    agendaFor,
    agendaParamsFix,
    eventLabel,
    groupByDay,
    seeksWork,
    toEventData,
    whenText,
    type AgendaItem,
} from '../selectors';

export const screenId = 'ACT-01';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const WEEK: readonly IsoDate[] = Array.from({ length: 7 }, (_, i) => addDays(WEEK_START, i));
const VIEWS = [
    { value: 'day', label: copy.agenda.views.day },
    { value: 'week', label: copy.agenda.views.week },
] as const;

export function AgendaScreen() {
    const { open, linkProps } = useOpenPath();
    const { actor, recienRegistrado } = useDemoSession();
    const applications = useApplications(actor.id, recienRegistrado);
    const [params, setParams] = useSearchParams();

    const items = useMemo(
        () => agendaFor(actor, applications, { recienRegistrado }),
        [actor, applications, recienRegistrado],
    );
    const thisWeek = items.filter((i) => i.date >= WEEK_START && i.date <= WEEK_END);
    const later = items.filter((i) => i.date > WEEK_END);

    const viewParam = params.get('vista');
    const view: CalendarView = viewParam === 'dia' ? 'day' : 'week';
    const dayParam = params.get('dia');
    // El día de la vista Día siempre está en la tira: si el de la URL no, hoy.
    const day: IsoDate =
        dayParam && ISO_DAY.test(dayParam) && WEEK.includes(dayParam) ? dayParam : WEEK.includes(TODAY) ? TODAY : WEEK_START;

    // Vista y día en la URL, en una sola navegación (tocar un día cambia los dos).
    const write = useCallback(
        (next: Record<string, string>) =>
            setParams(
                (prev) => {
                    const p = new URLSearchParams(prev);
                    for (const [k, v] of Object.entries(next)) p.set(k, v);
                    return p;
                },
                { replace: true, preventScrollReset: true },
            ),
        [setParams],
    );

    // Un ?dia fuera de la semana (o que no es una fecha) o una ?vista desconocida se corrigen en la
    // URL con lo que se ve: hoy y Semana. Sin ?dia ni ?vista no se escribe nada.
    useEffect(() => {
        const fix = agendaParamsFix(dayParam, viewParam, day);
        if (Object.keys(fix).length) write(fix);
    }, [dayParam, day, viewParam, write]);

    const pathOf = (item: AgendaItem) => targetPath(item.target, actor.id);
    // Sin hora de término, el nombre accesible no dice «de 10:00 a …».
    const event = (item: AgendaItem) => {
        const label = eventLabel(item);
        return (
            <AgendaEvent
                key={item.id}
                event={toEventData(item)}
                onClick={() => open(pathOf(item))}
                {...(label ? { 'aria-label': label } : {})}
            />
        );
    };

    if (items.length === 0) {
        const worker = seeksWork(actor);
        const turnos = actor.capabilities.includes('turnos');
        const noProfiles = actor.kind === 'persona' && actor.capabilities.length === 0;
        const text =
            actor.kind === 'organizacion'
                ? copy.agenda.emptyOrg
                : noProfiles
                  ? copy.agenda.emptyNoProfiles
                  : worker
                    ? copy.agenda.emptyWorker
                    : copy.agenda.emptyOther;
        // Otra pestaña: se cambia con replace (spec §5.3 regla 1).
        const action = noProfiles
            ? { label: copy.agenda.addProfile, onClick: () => open(paths.perfil(), { replace: true }) }
            : worker
              ? {
                    label: turnos ? copy.agenda.seeShifts : copy.agenda.seeJobs,
                    onClick: () => open(paths.explorar(turnos ? 'turno' : 'empleo'), { replace: true }),
                }
              : undefined;
        return <EmptyState icon={IconCalendar} title={copy.agenda.emptyTitle} text={text} action={action} />;
    }

    const dayItems = thisWeek.filter((i) => i.date === day);
    let content;
    if (view === 'week') {
        const next = later[0];
        content =
            thisWeek.length > 0 ? (
                <div>
                    {groupByDay(thisWeek).map((g) => (
                        <Fragment key={g.date}>
                            <p className="tl-agenda__day overline">{formatDayShort(g.date)}</p>
                            {g.items.map(event)}
                        </Fragment>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={IconCalendar}
                    title={copy.agenda.weekEmptyTitle}
                    text={next ? copy.agenda.weekEmptyNext(next.fecha) : copy.agenda.emptyWorker}
                />
            );
    } else {
        content =
            dayItems.length > 0 ? (
                <div>
                    <p className="tl-agenda__day overline">{formatDayShort(day)}</p>
                    {dayItems.map(event)}
                </div>
            ) : (
                <p className="tl-empty__text">{copy.agenda.dayEmpty}</p>
            );
    }
    // Como en CalendarWeek: el primer rótulo del día ya trae su margen de 24; si no hay lista, lo pone la pila.
    const listOwnsSpacing = view === 'week' ? thisWeek.length > 0 : dayItems.length > 0;

    return (
        <Stack gap={6}>
            {/* Siempre el mismo elemento raíz: la cabecera no se vuelve a montar al cambiar de vista y el foco no se pierde. */}
            <div className={cx(!listOwnsSpacing && 'tl-stack tl-stack--6')}>
                <Stack gap={4}>
                    <SegmentedControl
                        options={VIEWS}
                        value={view}
                        onChange={(v) => write({ vista: v === 'day' ? 'dia' : 'semana' })}
                        aria-label={copy.agenda.viewsLabel}
                    />
                    <WeekStrip
                        weekStart={WEEK_START}
                        today={TODAY}
                        selected={view === 'day' ? day : null}
                        counts={WEEK.map((d) => thisWeek.filter((i) => i.date === d).length)}
                        onSelect={(d) => write({ vista: 'dia', dia: d })}
                    />
                </Stack>
                {content}
            </div>
            {later.length > 0 && (
                <ListGroup label={copy.agenda.later}>
                    {later.map((item) => (
                        <ListItem
                            key={item.id}
                            {...linkProps(pathOf(item))}
                            icon={item.kind === 'entrevista' ? IconOffers : IconClock}
                            title={item.title}
                            sub={[whenText(item), [item.who, item.where].filter(Boolean).join(' · ')]}
                            status={<Badge status={item.status} />}
                        />
                    ))}
                </ListGroup>
            )}
        </Stack>
    );
}
