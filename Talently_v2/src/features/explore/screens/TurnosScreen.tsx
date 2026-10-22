// EXP-02 · Explorar · Turnos (/explorar?tipo=turno). Siempre lista agrupada
// por fecha con encabezados Overline (HOY, MAÑANA, ESTE FIN DE SEMANA, MÁS
// ADELANTE). Arriba, fijos bajo el SegmentedControl (TurnosChips): el Chip
// --menu de la comuna (abre SHT-COMUNA, `?sheet=comuna`) y los chips filter
// de oficio con «Todos», en la URL. Cada turno es una PublicationCard completa
// con el CTA de DET-01: «Tomar turno», «Unirme a la lista de espera» sin
// cupos, o «Ver mis postulaciones» si ya postuló. La tarjeta abre DET-01
// (/p/:id) con push; atrás vuelve al mismo scroll (flujos 2 y 9). Filtros
// EXP-06: fecha, distancia y «Solo organizaciones verificadas».
import { useSheet } from '../../../app/sheets';
import { paths } from '../../../app/paths';
import { Chip } from '../../../ui/Chip';
import { IconClock, IconLocation } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { PublicationCard, type PublicationCta } from '../../../ui/PublicationCard';
import { SheetPicker } from '../../../ui/SheetPicker';
import { useSnackbar } from '../../../ui/Snackbar';
import { Switch } from '../../../ui/Switch';
import { getExplore } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import type { DemoTurno } from '../../demo/types';
import { ExploreEmpty, fromDemo } from '../components/ExploreEmpty';
import { ExploreChips, type SegmentPanelProps } from '../components/ExploreLayout';
import { ChipSection, FiltersSheet } from '../components/FiltersSheet';
import { useDecisions, useExploreParams, useGo } from '../components/hooks';
import { useCommitOnClose } from '../components/useCommitOnClose';
import { useShowVerification } from '../components/VerificationSheet';
import { copy } from '../copy';
import {
    DISTANCIAS,
    FECHAS,
    readOficios,
    readTurnoFiltros,
    toggleOficio,
    TURNO_SIN_FILTROS,
    writeOficios,
    writeTurnoFiltros,
    type TurnoFiltros,
} from '../filters';
import { COMUNAS_RM } from '../mock';
import { countTurnos, hasTurnos, oficioChipsOf, publicationCard, turnoCta, turnoDays } from '../model';

export const screenId = 'EXP-02';

const COMUNA_OPTIONS = COMUNAS_RM.map((c) => ({ value: c, label: c }));

/** Chip de la comuna y chips de oficio, en la cabecera fija bajo el SegmentedControl. */
export function TurnosChips() {
    const { actor } = useDemoSession();
    const explore = getExplore(actor.id);
    const [params, update] = useExploreParams();
    const comunaSheet = useSheet('comuna');
    const { show } = useSnackbar();
    const chips = oficioChipsOf(explore);
    const oficios = readOficios(params, chips);
    const comuna = explore.turnos.comuna;

    // Cambiar de comuna llega con la búsqueda por ubicación (Supabase): hoy los turnos son los de su comuna.
    const onComuna = useCommitOnClose(comunaSheet.open, (next: string) => {
        if (next !== comuna) show({ message: copy.turnos.comunaPronto(comuna) });
    });

    return (
        <>
            <ExploreChips label={copy.turnos.chipsAria}>
                <Chip variant="menu" field={copy.turnos.comuna} aria-haspopup="dialog" onClick={() => comunaSheet.show()}>
                    {comuna}
                </Chip>
                <Chip selected={oficios.length === 0} onClick={() => update((p) => writeOficios(p, []))}>
                    {copy.turnos.todos}
                </Chip>
                {chips.map((o) => (
                    <Chip key={o} selected={oficios.includes(o)} onClick={() => update((p) => writeOficios(p, toggleOficio(chips, oficios, o)))}>
                        {o}
                    </Chip>
                ))}
            </ExploreChips>
            <SheetPicker
                open={comunaSheet.open}
                onClose={comunaSheet.hide}
                title={copy.turnos.comuna}
                options={COMUNA_OPTIONS}
                value={comuna}
                onChange={onComuna}
                searchPlaceholder={copy.turnos.buscarComuna}
                groupLabel={copy.turnos.grupoComunas}
                emptyIcon={IconLocation}
                emptyText={copy.turnos.sinComunaTexto}
            />
        </>
    );
}

export function TurnosScreen({ filtersSheet, focusPanel }: SegmentPanelProps) {
    const { actor, recienRegistrado } = useDemoSession();
    const explore = getExplore(actor.id);
    const [params, update] = useExploreParams();
    const { go, cardLink } = useGo();
    const showVerification = useShowVerification();
    const decided = useDecisions(actor.id, recienRegistrado);

    const activos = explore.filtrosActivos;
    const oficios = readOficios(params, oficioChipsOf(explore));
    const filtros = readTurnoFiltros(params, activos);
    const days = turnoDays(explore, oficios, filtros);

    const setFiltros = (next: TurnoFiltros) => update((p) => writeTurnoFiltros(p, next, activos));
    const quitarFiltros = () => {
        update((p) => {
            writeOficios(p, []);
            writeTurnoFiltros(p, TURNO_SIN_FILTROS, activos);
        });
        focusPanel();
    };

    const card = (p: DemoTurno) => {
        const detalle = paths.publicacion(p.id);
        const kind = turnoCta(p, decided(p.id));
        const cta: PublicationCta =
            kind === 'postulado'
                ? { label: copy.turnos.verPostulaciones, end: true, onClick: () => go(paths.actividad('postulaciones')) }
                : {
                      label: kind === 'espera' ? copy.turnos.listaEspera : copy.turnos.tomarTurno,
                      end: true,
                      onClick: () => go(detalle),
                  };
        return (
            <PublicationCard
                key={p.id}
                {...publicationCard(p, { ...cardLink(detalle), onVerify: () => showVerification({ publicacion: p.id }) })}
                cta={cta}
            />
        );
    };

    let content;
    if (!hasTurnos(explore)) {
        const vacio = explore.turnos.vacio;
        content = vacio ? <ExploreEmpty {...fromDemo(vacio, IconClock, actor.id, go)} /> : null;
    } else if (days.length === 0) {
        content = (
            <ExploreEmpty
                icon={IconClock}
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
        <>
            <Stack gap={3} className="explore-fill">
                {content}
            </Stack>

            {hasTurnos(explore) && (
                <FiltersSheet
                    sheet={filtersSheet}
                    applied={filtros}
                    empty={TURNO_SIN_FILTROS}
                    onApply={setFiltros}
                    applyLabel={(d) => copy.filtros.verTurnos(countTurnos(turnoDays(explore, oficios, d)))}
                >
                    {(draft, setDraft) => (
                        <>
                            <ChipSection
                                label={copy.filtros.fecha}
                                options={FECHAS.map((f) => ({ value: f, label: f }))}
                                value={draft.fechas}
                                onChange={(fechas) => setDraft({ ...draft, fechas })}
                            />
                            <ChipSection
                                label={copy.filtros.distancia}
                                single
                                options={DISTANCIAS.map((km) => ({ value: km, label: copy.filtros.hasta(km) }))}
                                value={draft.distancia === null ? [] : [draft.distancia]}
                                onChange={([km]) => setDraft({ ...draft, distancia: km ?? null })}
                            />
                            <Switch
                                label={copy.filtros.soloVerificadas}
                                description={copy.filtros.soloVerificadasDesc}
                                checked={draft.verificadas}
                                onChange={(e) => setDraft({ ...draft, verificadas: e.target.checked })}
                            />
                        </>
                    )}
                </FiltersSheet>
            )}
        </>
    );
}
