// ACT-01 · Actividad · Agenda (spec §5.2 y §5.4): vista Semana o Día con
// CalendarWeek y todo lo que tiene fecha (turnos confirmados, entrevistas;
// la organización ve sus turnos con los cupos cubiertos). La vista y el día
// van en la URL (?seg=agenda&vista=dia&dia=2026-12-12): atrás y la memoria de
// la pestaña vuelven a lo mismo. CalendarWeek aún no cambia de semana (brecha
// de src/ui), así que lo que viene después de esta semana va en «Más adelante».
import { useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '../../../ui/Badge';
import { CalendarWeek, type AgendaEventData, type CalendarView } from '../../../ui/CalendarWeek';
import { EmptyState } from '../../../ui/EmptyState';
import { IconCalendar, IconClock, IconOffers } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { LinkListItem } from '../components/LinkListItem';
import { ListGroup } from '../components/ListGroup';
import { copy } from '../copy';
import { TODAY, WEEK_END, WEEK_START, agendaFor, seeksWork, targetPath, type AgendaItem } from '../selectors';
import { useCancelledShifts } from '../shiftStore';

export const screenId = 'ACT-01';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Cambia parámetros de la URL sin perder los demás (?seg=agenda). Junta los
 * cambios del mismo toque en una sola navegación: tocar un día de la tira
 * cambia el día y la vista a la vez, y dos navegaciones seguidas se pisarían.
 */
function useParamWriter() {
    const [params, setParams] = useSearchParams();
    const pending = useRef<URLSearchParams | null>(null);
    const write = useCallback(
        (key: string, value: string) => {
            if (!pending.current) {
                pending.current = new URLSearchParams(params);
                queueMicrotask(() => {
                    const next = pending.current;
                    pending.current = null;
                    if (next) setParams(next, { replace: true, preventScrollReset: true });
                });
            }
            pending.current.set(key, value);
        },
        [params, setParams],
    );
    return [params, write] as const;
}

/** Fecha y horario como se dicen: «lun 14 dic · 09:00» o «sáb 19 dic · 18:00–00:00». */
function whenText({ source }: AgendaItem): string {
    return `${source.fecha} · ${source.inicio}${source.fin ? `–${source.fin}` : ''}`;
}

export function AgendaScreen() {
    const navigate = useNavigate();
    const { actor } = useDemoSession();
    const cancelled = useCancelledShifts();
    const [params, writeParam] = useParamWriter();

    const items = useMemo(() => agendaFor(actor, cancelled), [actor, cancelled]);
    const thisWeek = items.filter((i) => i.event.date >= WEEK_START && i.event.date <= WEEK_END);
    const later = items.filter((i) => i.event.date > WEEK_END);

    const view: CalendarView = params.get('vista') === 'dia' ? 'day' : 'week';
    const dayParam = params.get('dia');
    const day = dayParam && ISO_DAY.test(dayParam) ? dayParam : TODAY;

    const openEvent = (event: AgendaEventData) => {
        const item = items.find((i) => i.event.id === event.id);
        if (item) navigate(targetPath(item.source.destino));
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
        const action = noProfiles
            ? { label: copy.agenda.addProfile, onClick: () => navigate(paths.perfil()) }
            : worker
              ? {
                    label: turnos ? copy.agenda.seeShifts : copy.agenda.seeJobs,
                    onClick: () => navigate(paths.explorar(turnos ? 'turno' : 'empleo')),
                }
              : undefined;
        return <EmptyState icon={IconCalendar} title={copy.agenda.emptyTitle} text={text} action={action} />;
    }

    const next = later[0];

    return (
        <Stack gap={6}>
            <CalendarWeek
                view={view}
                onViewChange={(v) => writeParam('vista', v === 'day' ? 'dia' : 'semana')}
                weekStart={WEEK_START}
                today={TODAY}
                day={day}
                onDayChange={(d) => writeParam('dia', d)}
                events={thisWeek.map((i) => i.event)}
                onEventClick={openEvent}
                empty={
                    <EmptyState
                        icon={IconCalendar}
                        title={copy.agenda.weekEmptyTitle}
                        text={next ? copy.agenda.weekEmptyNext(next.source.fecha) : copy.agenda.emptyWorker}
                    />
                }
            />
            {later.length > 0 && (
                <ListGroup label={copy.agenda.later}>
                    {later.map((item) => (
                        <LinkListItem
                            key={item.event.id}
                            to={targetPath(item.source.destino)}
                            icon={item.event.kind === 'entrevista' ? IconOffers : IconClock}
                            title={item.event.title}
                            sub={[whenText(item), [item.event.who, item.event.where].filter(Boolean).join(' · ')]}
                            status={<Badge status={item.event.status} />}
                        />
                    ))}
                </ListGroup>
            )}
        </Stack>
    );
}
