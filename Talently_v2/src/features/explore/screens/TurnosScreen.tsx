// EXP-02 · Explorar · Turnos (/explorar?tipo=turno). Siempre lista agrupada
// por fecha con encabezados Overline (HOY, MAÑANA, ESTE FIN DE SEMANA, MÁS
// ADELANTE). Arriba, fijos bajo el SegmentedControl (TurnosChips): el Chip
// --menu de la comuna (SHT-COMUNA, `?sheet=comuna`: con otra comuna se ven
// solo los turnos de esa comuna) y los chips filter de oficio con «Todos»,
// todo en la URL. Cada turno es una PublicationCard completa con el CTA de
// DET-01: «Tomar turno» o, sin cupos, «Unirme a la lista de espera» (un
// toque, spec §3.2: si falta el celular verificado, abre DET-01 con AUTH-08
// y al verificar toma el turno; flujo 2), o «Ver mis postulaciones» si ya
// postuló. La tarjeta abre DET-01 (/p/:id) con push; atrás vuelve al mismo
// scroll (flujos 2 y 9). Filtros EXP-06: fecha, franja, distancia, tarifa
// líquida mínima y «Solo organizaciones verificadas».
import { useCallback, useState } from 'react';
import { useSheet } from '../../../app/sheets';
import { paths } from '../../../app/paths';
import { AVAILABILITY_BANDS } from '../../../ui/AvailabilityGrid';
import { Chip } from '../../../ui/Chip';
import { IconClock, IconLocation } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { MoneyField } from '../../../ui/MoneyField';
import { PublicationCard, type PublicationCta } from '../../../ui/PublicationCard';
import { SheetPicker } from '../../../ui/SheetPicker';
import { useSnackbar } from '../../../ui/Snackbar';
import { Switch } from '../../../ui/Switch';
import { getExplore } from '../../demo/data';
import { useLivePublication } from '../../demo/manageHooks';
import { useDemoSession } from '../../demo/session';
import { applyTo } from '../../demo/sessionStore';
import type { DemoTurno } from '../../demo/types';
import { ExploreEmpty, fromDemo } from '../components/ExploreEmpty';
import { ExploreChips, type SegmentPanelProps } from '../components/ExploreLayout';
import { ChipSection, FiltersSheet } from '../components/FiltersSheet';
import { useDecisions, useExploreParams, useGo, useLater } from '../components/hooks';
import { useCommitOnClose } from '../components/useCommitOnClose';
import { useShowVerification } from '../components/VerificationSheet';
import { copy } from '../copy';
import {
    DISTANCIAS,
    FECHAS,
    FRANJAS,
    readComuna,
    readOficios,
    readTurnoFiltros,
    TARIFA_UNIDADES,
    toggleOficio,
    TURNO_SIN_FILTROS,
    writeComuna,
    writeOficios,
    writeTurnoFiltros,
    type TurnoFiltros,
} from '../filters';
import { COMUNAS_RM } from '../../demo/catalog';
import { TOMAR_TURNO_MS } from '../mock';
import {
    actorPhoneVerified,
    countTurnos,
    hasTurnos,
    hasTurnosIn,
    oficioChipsOf,
    publicationCard,
    turnoCta,
    turnoDays,
} from '../model';

export const screenId = 'EXP-02';

const COMUNA_OPTIONS = COMUNAS_RM.map((c) => ({ value: c, label: c }));

/** «Mañana · 07–13» (el diccionario de franjas de AvailabilityGrid). */
const FRANJA_OPTIONS = FRANJAS.map((f) => {
    const band = AVAILABILITY_BANDS.find((b) => b.value === f);
    return { value: f, label: band ? `${band.label} · ${band.hours}` : f };
});

/** La comuna elegida en el Chip: null = cerca de la comuna del actor (todos sus turnos). */
function useComuna(): { comuna: string; home: string; filter: string | null } {
    const { actor } = useDemoSession();
    const [params] = useExploreParams();
    const home = getExplore(actor.id).turnos.comuna;
    const comuna = readComuna(params, COMUNAS_RM, home);
    return { comuna, home, filter: comuna === home ? null : comuna };
}

/** Chip de la comuna y chips de oficio, en la cabecera fija bajo el SegmentedControl. */
export function TurnosChips() {
    const { actor } = useDemoSession();
    const explore = getExplore(actor.id);
    const [params, update] = useExploreParams();
    const comunaSheet = useSheet('comuna');
    const { comuna, home } = useComuna();
    const chips = oficioChipsOf(explore);
    const oficios = readOficios(params, chips);

    // Se escribe en la URL (replace) al cerrarse la hoja: así atrás no la borra.
    const onComuna = useCommitOnClose(
        comunaSheet.open,
        useCallback((next: string) => update((p) => writeComuna(p, next, home)), [update, home]),
    );

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
    const { show } = useSnackbar();
    const later = useLater();
    const showVerification = useShowVerification();
    // useDecisions lee la sesión: también vuelve a pintar cuando el celular queda verificado.
    const decided = useDecisions(actor.id, recienRegistrado);
    const phoneOk = actorPhoneVerified(actor.id, recienRegistrado);
    const [taking, setTaking] = useState<string | null>(null);
    const { home, filter: comuna } = useComuna();

    const activos = explore.filtrosActivos;
    const oficios = readOficios(params, oficioChipsOf(explore));
    const filtros = readTurnoFiltros(params, activos);
    const days = turnoDays(explore, oficios, filtros, comuna);

    const setFiltros = (next: TurnoFiltros) => update((p) => writeTurnoFiltros(p, next, activos));
    const quitarFiltros = () => {
        update((p) => {
            writeOficios(p, []);
            writeTurnoFiltros(p, TURNO_SIN_FILTROS, activos);
        });
        focusPanel();
    };
    const verCerca = () => {
        update((p) => writeComuna(p, home, home));
        focusPanel();
    };

    /**
     * «Tomar turno» en un toque (spec §3.2), como en DET-01: sin el celular
     * verificado, abre DET-01 con AUTH-08 (`?sheet=telefono`), que al
     * verificar toma el turno (flujo 2); con él, lo toma aquí mismo.
     */
    const take = (p: DemoTurno, waitlist: boolean) => {
        if (!phoneOk) {
            go(`${paths.publicacion(p.id)}?sheet=telefono`);
            return;
        }
        setTaking(p.id);
        later(() => {
            setTaking(null);
            applyTo(actor.id, p.id, waitlist ? 'En lista de espera' : 'Postulado');
            show({ message: waitlist ? copy.turnos.tomadoEspera : copy.turnos.tomado, tone: 'success' });
        }, TOMAR_TURNO_MS);
    };

    // Los cupos que quedan con lo confirmado en GES-04 (los mismos de DET-01).
    const live = useLivePublication();
    const card = (data: DemoTurno) => {
        const p = live(data);
        const detalle = paths.publicacion(p.id);
        const kind = turnoCta(p, decided(p.id));
        const cta: PublicationCta =
            kind === 'postulado'
                ? { label: copy.turnos.verPostulaciones, end: true, onClick: () => go(paths.actividad('postulaciones')) }
                : {
                      label: kind === 'espera' ? copy.turnos.listaEspera : copy.turnos.tomarTurno,
                      end: true,
                      loading: taking === p.id,
                      loadingLabel: copy.turnos.tomando,
                      onClick: () => {
                          if (taking === null) take(p, kind === 'espera');
                      },
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
    } else if (comuna !== null && !hasTurnosIn(explore, comuna)) {
        content = (
            <ExploreEmpty
                icon={IconLocation}
                title={copy.turnos.sinTurnosEn.titulo(comuna)}
                text={copy.turnos.sinTurnosEn.texto}
                action={{ label: copy.turnos.sinTurnosEn.accion(home), onClick: verCerca }}
            />
        );
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
                    applyLabel={(d) => copy.filtros.verTurnos(countTurnos(turnoDays(explore, oficios, d, comuna)))}
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
                                label={copy.filtros.franja}
                                options={FRANJA_OPTIONS}
                                value={draft.franjas}
                                onChange={(franjas) => setDraft({ ...draft, franjas })}
                            />
                            <ChipSection
                                label={copy.filtros.distancia}
                                single
                                options={DISTANCIAS.map((km) => ({ value: km, label: copy.filtros.hasta(km) }))}
                                value={draft.distancia === null ? [] : [draft.distancia]}
                                onChange={([km]) => setDraft({ ...draft, distancia: km ?? null })}
                            />
                            {/* El mismo ritmo que las secciones de Chips (24 px entre una y otra). */}
                            <Stack gap={6}>
                                <MoneyField
                                    label={copy.filtros.tarifaMin}
                                    help={copy.filtros.tarifaMinAyuda}
                                    value={draft.tarifaMin}
                                    onChange={(tarifaMin) => setDraft({ ...draft, tarifaMin })}
                                    unit={draft.tarifaUnidad}
                                    onUnitChange={(unit) => {
                                        if (unit === 'turno' || unit === 'hora') setDraft({ ...draft, tarifaUnidad: unit });
                                    }}
                                    units={TARIFA_UNIDADES}
                                    unitSheetTitle={copy.filtros.unidad}
                                />
                                <Switch
                                    label={copy.filtros.soloVerificadas}
                                    description={copy.filtros.soloVerificadasDesc}
                                    checked={draft.verificadas}
                                    onChange={(e) => setDraft({ ...draft, verificadas: e.target.checked })}
                                />
                            </Stack>
                        </>
                    )}
                </FiltersSheet>
            )}
        </>
    );
}
