import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { EmptyState } from '../EmptyState';
import { IconCalendar } from '../icons';
import { AgendaEvent, CalendarWeek, WeekStrip, type AgendaEventData, type CalendarView } from './CalendarWeek';
import type { IsoDate } from './dates';

/** Contenido de una pantalla de 390 (margen lateral space-4), como ACT-01. */
function Phone({ children }: { children: ReactNode }) {
    return (
        <DemoFrame width={390}>
            <div className="tl-app-screen__content">{children}</div>
        </DemoFrame>
    );
}

// Agenda de Matías Rojas (F1) · hoy es jue 10 dic 2026.
const HOY = '2026-12-10';
const LUNES = '2026-12-07';
const MATIAS: AgendaEventData[] = [
    {
        id: 'bartender-andino',
        date: '2026-12-11',
        start: '19:00',
        end: '01:00',
        kind: 'turno',
        title: 'Turno · Bartender',
        who: 'Hotel Andino',
        where: 'Las Condes',
        status: 'Confirmado',
    },
    {
        id: 'garzon-rosa-sab',
        date: '2026-12-12',
        start: '18:00',
        end: '00:00',
        kind: 'turno',
        title: 'Turno · Garzón',
        who: 'Banquetería Rosa SpA',
        where: 'San Miguel',
        status: 'Confirmado',
    },
    {
        id: 'garzon-rosa-dom',
        date: '2026-12-13',
        start: '13:00',
        end: '19:00',
        kind: 'turno',
        title: 'Turno · Garzón',
        who: 'Banquetería Rosa SpA',
        where: 'San Miguel',
        status: 'Postulado',
    },
];
const COUNTS = [0, 0, 0, 0, 1, 1, 1];

// Ícono del tipo: el mismo de la publicación de donde viene (M4).
const POR_TIPO: AgendaEventData[] = [
    {
        id: 't',
        date: '2026-12-12',
        start: '19:00',
        end: '00:00',
        kind: 'turno',
        title: 'Turno · Garzón',
        who: 'Banquetería Rosa SpA',
        where: 'Providencia',
        status: 'Confirmado',
    },
    {
        id: 'e',
        date: '2026-12-15',
        start: '10:00',
        end: '10:45',
        kind: 'entrevista',
        title: 'Entrevista · Mecánico/a automotriz',
        who: 'Taller Los Aromos',
        where: 'Macul',
        status: 'Entrevista',
    },
    {
        id: 'c',
        date: '2027-03-11',
        start: '17:00',
        end: '18:00',
        kind: 'clase',
        title: 'Clase · PAES M1',
        who: 'Josefa Morales',
        where: 'Online',
        status: 'Confirmada',
    },
    {
        id: 'v',
        date: '2027-03-12',
        start: '15:00',
        end: '16:00',
        kind: 'visita',
        title: 'Visita · Gasfitería',
        where: 'Ñuñoa',
        status: 'Reservado',
    },
];

const nada = () => {};

function Agenda({ initialView, initialDay }: { initialView: CalendarView; initialDay: IsoDate }) {
    const [view, setView] = useState<CalendarView>(initialView);
    const [day, setDay] = useState<IsoDate>(initialDay);
    return (
        <CalendarWeek
            view={view}
            onViewChange={setView}
            weekStart={LUNES}
            today={HOY}
            day={day}
            onDayChange={setDay}
            events={MATIAS}
            onEventClick={nada}
            empty={
                <EmptyState
                    icon={IconCalendar}
                    title="Aún no tienes nada agendado"
                    text="Cuando te confirmen un turno o una entrevista, aparecerá aquí."
                    action={{ label: 'Ver turnos de esta semana', onClick: nada }}
                />
            }
        />
    );
}

function CalendarWeekDemo() {
    return (
        <>
            <DemoLabel>
                <Badge>F1</Badge> Actividad · Agenda de Matías Rojas · hoy es jue 10 dic
            </DemoLabel>
            <DemoSection title="Semana · 7 días con punto en los días con algo + agenda">
                <Phone>
                    <Agenda initialView="week" initialDay={HOY} />
                </Phone>
                <DemoLabel>Toca un día para abrirlo en la vista Día; «Semana» vuelve a la agenda en lista.</DemoLabel>
            </DemoSection>
            <DemoSection title="Día · sáb 12 dic">
                <Phone>
                    <Agenda initialView="day" initialDay="2026-12-12" />
                </Phone>
            </DemoSection>
            <DemoSection title="Ícono del tipo · el mismo de la publicación de donde viene">
                <Phone>
                    <div>
                        {POR_TIPO.map((e) => (
                            <AgendaEvent key={e.id} event={e} onClick={nada} />
                        ))}
                    </div>
                </Phone>
                <DemoLabel>
                    Turno IconClock · Entrevista de un empleo IconOffers · Clase IconBook (desde F2) · Visita de un servicio
                    IconTool (desde F3). Un frame F1 solo muestra turnos y entrevistas. El ícono va en color-text-2, a 20 px,
                    antes del título.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Default">
                <Phone>
                    <WeekStrip weekStart={LUNES} today={HOY} selected={null} counts={COUNTS} onSelect={nada} />
                </Phone>
                <DemoLabel>Hoy (jue 10) con anillo color-primary-text; punto en los días con turnos.</DemoLabel>
            </DemoSection>
            <DemoSection title="Presionado">
                <Phone>
                    <WeekStrip
                        weekStart={LUNES}
                        today={HOY}
                        selected={null}
                        counts={COUNTS}
                        onSelect={nada}
                        dayClassName={{ '2026-12-09': 'is-pressed' }}
                    />
                </Phone>
            </DemoSection>
            <DemoSection title="Foco">
                <Phone>
                    <WeekStrip
                        weekStart={LUNES}
                        today={HOY}
                        selected={null}
                        counts={COUNTS}
                        onSelect={nada}
                        dayClassName={{ '2026-12-11': 'is-focus' }}
                    />
                </Phone>
            </DemoSection>
            <DemoSection title="Seleccionado">
                <Phone>
                    <WeekStrip weekStart={LUNES} today={HOY} selected="2026-12-12" counts={COUNTS} onSelect={nada} />
                </Phone>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <DemoNotApplicable>Todos los días se pueden abrir; un día sin nada muestra «Sin turnos este día».</DemoNotApplicable>
                <Phone>
                    <CalendarWeek
                        view="day"
                        onViewChange={nada}
                        weekStart={LUNES}
                        today={HOY}
                        day="2026-12-08"
                        onDayChange={nada}
                        events={MATIAS}
                        onEventClick={nada}
                    />
                </Phone>
            </DemoSection>
            <DemoSection title="Error">
                <Phone>
                    <CalendarWeek
                        view="week"
                        onViewChange={nada}
                        weekStart={LUNES}
                        today={HOY}
                        day={HOY}
                        onDayChange={nada}
                        events={[]}
                        onEventClick={nada}
                        error={{ onRetry: nada }}
                    />
                </Phone>
                <DemoLabel>Un día no tiene estado de error: si la agenda no carga, ErrorState en la lista.</DemoLabel>
            </DemoSection>
            <DemoSection title="Cargando">
                <Phone>
                    <CalendarWeek
                        view="week"
                        onViewChange={nada}
                        weekStart={LUNES}
                        today={HOY}
                        day={HOY}
                        onDayChange={nada}
                        events={MATIAS}
                        onEventClick={nada}
                        loading
                    />
                </Phone>
                <DemoLabel>La lista del día carga con Skeleton de lista.</DemoLabel>
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'CalendarWeek',
    group: 'Agenda y archivos',
    summary: 'La Agenda en dos vistas: Semana (tira de 7 días con punto + compromisos en lista) y Día (horas de 48 px con bloques). Hoy con anillo; cada compromiso con el ícono de su tipo.',
    Demo: CalendarWeekDemo,
};

export default demo;
