// EXP-02 · Explorar · Turnos (/explorar?tipo=turno). Siempre lista agrupada
// por fecha con encabezados Overline (HOY, MAÑANA, ESTE FIN DE SEMANA, MÁS
// ADELANTE). Arriba, fijos bajo el SegmentedControl: el Chip --menu de la
// comuna (abre SHT-COMUNA) y los chips filter de oficio con «Todos». Cada
// turno es una PublicationCard completa con «Tomar turno», que abre DET-01
// (/p/:id) con push; atrás vuelve al mismo scroll (flujo 9). Filtros EXP-06:
// fecha, distancia y «Solo organizaciones verificadas».
import { useMemo, useState } from 'react';
import { paths } from '../../../app/paths';
import { Chip } from '../../../ui/Chip';
import { IconCalendar, IconLocation } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { PublicationCard } from '../../../ui/PublicationCard';
import { SheetPicker } from '../../../ui/SheetPicker';
import { useSnackbar } from '../../../ui/Snackbar';
import { Switch } from '../../../ui/Switch';
import { getExplore } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import type { DemoTurno } from '../../demo/types';
import { ExploreEmpty, fromDemo } from '../components/ExploreEmpty';
import { ExploreChips } from '../components/ExploreHead';
import { ExploreLayout, type SegmentScreenProps } from '../components/ExploreLayout';
import { ChipSection, FiltersSheet, useFiltersDraft } from '../components/FiltersSheet';
import { useLinks } from '../components/useLinks';
import { useVerificationSheet } from '../components/VerificationSheet';
import { copy } from '../copy';
import { useRemembered } from '../memory';
import { COMUNAS_RM } from '../mock';
import {
    countTurnoFiltros,
    countTurnos,
    defaultTurnoFiltros,
    DISTANCIAS,
    FECHAS,
    publicationCard,
    TURNO_SIN_FILTROS,
    turnoDays,
    type TurnoFiltros,
} from '../model';

export const screenId = 'EXP-02';

const COMUNA_OPTIONS = COMUNAS_RM.map((c) => ({ value: c, label: c }));

export function TurnosScreen(props: SegmentScreenProps) {
    const { actor } = useDemoSession();
    const explore = getExplore(actor.id);
    const links = useLinks();
    const { show } = useSnackbar();
    const [onVerify, verificationSheet] = useVerificationSheet();
    const [comunaOpen, setComunaOpen] = useState(false);

    // Los chips de oficio y los filtros sobreviven a ir al detalle y volver (y al cambio de pestaña).
    const [oficios, setOficios] = useRemembered<string[]>(`${actor.id}:turno:oficios`, () => []);
    const [filtros, setFiltros] = useRemembered<TurnoFiltros>(`${actor.id}:turno:filtros`, () =>
        defaultTurnoFiltros(explore.filtrosActivos),
    );
    const sheet = useFiltersDraft(filtros, setFiltros);

    const hasTurnos = explore.turnos.dias.some((d) => d.publicaciones.length > 0);
    const days = useMemo(() => turnoDays(explore, oficios, filtros), [explore, oficios, filtros]);
    const draftCount = countTurnos(turnoDays(explore, oficios, sheet.draft));
    const oficioChips = explore.turnos.filtros.filter((f) => f !== copy.turnos.todos);
    const comuna = explore.turnos.comuna;

    const toggleOficio = (o: string) =>
        setOficios((prev) => oficioChips.filter((x) => (x === o ? !prev.includes(o) : prev.includes(x))));

    const quitarFiltros = () => {
        setOficios([]);
        setFiltros(TURNO_SIN_FILTROS);
    };

    const onComuna = (next: string) => {
        // Cambiar de comuna llega con la búsqueda por ubicación (Supabase): hoy los turnos son los de su comuna.
        if (next !== comuna) show({ message: copy.turnos.comunaPronto(comuna) });
    };

    const card = (p: DemoTurno) => {
        const detalle = paths.publicacion(p.id);
        return (
            <PublicationCard
                key={p.id}
                {...publicationCard(p, { href: links.href(detalle), onOpen: links.open(detalle), onVerify })}
                cta={{ label: copy.turnos.tomarTurno, end: true, onClick: () => links.go(detalle) }}
            />
        );
    };

    const chips = hasTurnos ? (
        <ExploreChips label={copy.turnos.chipsAria}>
            <Chip variant="menu" field={copy.turnos.comuna} onClick={() => setComunaOpen(true)}>
                {comuna}
            </Chip>
            <Chip selected={oficios.length === 0} onClick={() => setOficios([])}>
                {copy.turnos.todos}
            </Chip>
            {oficioChips.map((o) => (
                <Chip key={o} selected={oficios.includes(o)} onClick={() => toggleOficio(o)}>
                    {o}
                </Chip>
            ))}
        </ExploreChips>
    ) : undefined;

    let content;
    if (!hasTurnos) {
        const vacio = explore.turnos.vacio;
        content = vacio ? <ExploreEmpty {...fromDemo(vacio, IconCalendar, links.go)} /> : null;
    } else if (days.length === 0) {
        content = (
            <ExploreEmpty
                icon={IconCalendar}
                title={copy.turnos.sinResultados.titulo}
                text={copy.turnos.sinResultados.texto}
                action={{ label: copy.turnos.sinResultados.accion, onClick: quitarFiltros }}
            />
        );
    } else {
        content = (
            <Stack gap={6}>
                {days.map((d) => (
                    <section key={d.titulo} aria-label={d.titulo}>
                        <Stack gap={3}>
                            <h2 className="overline explore-day__title">{d.titulo}</h2>
                            {d.turnos.map(card)}
                        </Stack>
                    </section>
                ))}
            </Stack>
        );
    }

    return (
        <ExploreLayout
            {...props}
            chips={chips}
            filterCount={hasTurnos ? countTurnoFiltros(filtros) : 0}
            onFilters={hasTurnos ? sheet.openSheet : undefined}
        >
            <Stack gap={3} className="explore-fill">
                {content}
            </Stack>

            <FiltersSheet
                open={sheet.open}
                onClose={sheet.close}
                onClear={() => sheet.setDraft(TURNO_SIN_FILTROS)}
                onApply={sheet.apply}
                applyLabel={copy.filtros.verTurnos(draftCount)}
            >
                <ChipSection
                    label={copy.filtros.fecha}
                    options={FECHAS.map((f) => ({ value: f, label: f }))}
                    value={sheet.draft.fechas}
                    onChange={(fechas) => sheet.setDraft({ ...sheet.draft, fechas })}
                />
                <ChipSection
                    label={copy.filtros.distancia}
                    single
                    options={DISTANCIAS.map((km) => ({ value: km, label: copy.filtros.hasta(km) }))}
                    value={sheet.draft.distancia === null ? [] : [sheet.draft.distancia]}
                    onChange={([km]) => sheet.setDraft({ ...sheet.draft, distancia: km ?? null })}
                />
                <Switch
                    label={copy.filtros.soloVerificadas}
                    description={copy.filtros.soloVerificadasDesc}
                    checked={sheet.draft.verificadas}
                    onChange={(e) => sheet.setDraft({ ...sheet.draft, verificadas: e.target.checked })}
                />
            </FiltersSheet>

            <SheetPicker
                open={comunaOpen}
                onClose={() => setComunaOpen(false)}
                title={copy.turnos.comuna}
                options={COMUNA_OPTIONS}
                value={comuna}
                onChange={onComuna}
                searchPlaceholder={copy.turnos.buscarComuna}
                groupLabel={copy.turnos.grupoComunas}
                emptyIcon={IconLocation}
                emptyText={copy.turnos.sinComunaTexto}
            />
            {verificationSheet}
        </ExploreLayout>
    );
}
