// EXP-01 · Explorar · Empleos (/explorar?tipo=empleo). Deck de publicaciones
// (PublicationCardDeck) con «Ver lista» arriba a la derecha; la lista usa
// PublicationCard compacta (EXP-01-lista). Tocar la tarjeta abre DET-01
// (/p/:id) con push (flujo 3). «Me interesa» abre la postulación (spec §3.1:
// DET-01 con DET-02 abierta); «No me interesa» la saca con Snackbar
// «Deshacer». Lo decidido vive en demo/sessionStore: una oferta a la que ya
// postuló (aquí o en DET-01) o que descartó en el detalle no vuelve al deck.
// En la lista, las que ya postuló o marcó con «Me interesa» lo dicen en su
// primer dato. Filtros EXP-06 (en la URL): jornada, contrato, distancia,
// sueldo líquido mínimo y «Solo organizaciones verificadas».
import { useCallback, useEffect, useRef, useState } from 'react';
import { paths } from '../../../app/paths';
import { IconOffers } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { MoneyField } from '../../../ui/MoneyField';
import { PublicationCard, type PublicationCardData } from '../../../ui/PublicationCard';
import { PublicationCardDeck, type DeckDecision, type PublicationDeckCard } from '../../../ui/PublicationCardDeck';
import { useSnackbar } from '../../../ui/Snackbar';
import { Switch } from '../../../ui/Switch';
import { getExplore } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import { decide, undoDecision } from '../../demo/sessionStore';
import type { DemoEmpleo } from '../../demo/types';
import { ExploreBar } from '../components/ExploreBar';
import { ExploreEmpty, fromDemo, type ExploreEmptyProps } from '../components/ExploreEmpty';
import type { SegmentPanelProps } from '../components/ExploreLayout';
import { ChipSection, FiltersSheet } from '../components/FiltersSheet';
import { useDecisions, useExploreParams, useGo } from '../components/hooks';
import { useDeckHeight } from '../components/useDeckHeight';
import { useShowVerification } from '../components/VerificationSheet';
import { copy } from '../copy';
import {
    CONTRATOS,
    DISTANCIAS,
    EMPLEO_SIN_FILTROS,
    JORNADAS,
    readEmpleoFiltros,
    readVista,
    writeEmpleoFiltros,
    writeVista,
    type EmpleoFiltros,
    type ExploreVista,
} from '../filters';
import { deckAndList, empleosOf, passesEmpleo, publicationCard, type Decided } from '../model';

export const screenId = 'EXP-01';

/** Los empleos de la demo pagan al mes: el sueldo mínimo se compara al mes. */
const SUELDO_UNIDADES = ['mes'] as const;

/** En la lista, lo ya decidido va primero entre sus datos («Postulaste», «Te interesa»): la compacta muestra 2. */
function withState(card: PublicationCardData, decided: Decided): PublicationCardData {
    const label = decided === 'postulado' ? copy.empleos.postulaste : decided === 'si' ? copy.empleos.teInteresa : null;
    return label ? { ...card, tags: [{ label }, ...(card.tags ?? [])] } : card;
}

/** DET-01 con la hoja Postular (DET-02) abierta: `?sheet=postular` (spec §5.4). */
const postularPath = (id: string) => `${paths.publicacion(id)}?sheet=postular`;

export function EmpleosScreen({ filtersSheet, focusPanel }: SegmentPanelProps) {
    const { actor, recienRegistrado } = useDemoSession();
    const explore = getExplore(actor.id);
    const [params, update] = useExploreParams();
    const { go, cardLink } = useGo();
    const { show, hide } = useSnackbar();
    const showVerification = useShowVerification();
    const decided = useDecisions(actor.id, recienRegistrado);
    const deckRef = useRef<HTMLDivElement>(null);
    // Al decidir la última tarjeta, el foco pasa al EmptyState (README del deck).
    const [focusEmpty, setFocusEmpty] = useState(false);
    // «Cambiar filtros» del EmptyState: al aplicar, ese botón ya no está y el foco va al panel.
    const focusAfterFilters = useRef(false);
    // «Deshacer» de la última tarjeta: el EmptyState que tenía el foco se va y la tarjeta vuelve.
    const focusAfterUndo = useRef(false);

    const activos = explore.filtrosActivos;
    const filtros = readEmpleoFiltros(params, activos);
    const vista = readVista(params, 'empleo', explore.empleos.vista);
    const all = empleosOf(explore);
    const filtered = all.filter((p) => passesEmpleo(p, filtros));
    const { deck, list } = deckAndList(filtered, decided);
    // Lo que la vista actual mostraría sin filtros: en el deck, lo no decidido; en la lista, todo menos «No me interesa».
    const inView = (p: DemoEmpleo) => (vista === 'deck' ? decided(p.id) === undefined : decided(p.id) !== 'no');
    const hiddenByFilters = all.filter((p) => inView(p) && !passesEmpleo(p, filtros)).length;
    const cardMinHeight = useDeckHeight(deckRef, vista === 'deck' && deck.length > 0);
    const focusOnMount = useCallback((el: HTMLDivElement | null) => el?.focus(), []);

    // Después de deshacer, si el foco quedó en el body (se fue el EmptyState), pasa al ActionPair de la tarjeta que volvió.
    useEffect(() => {
        if (!focusAfterUndo.current) return;
        focusAfterUndo.current = false;
        const active = document.activeElement;
        if (active instanceof HTMLElement && active !== document.body && active.isConnected) return;
        const target = deckRef.current?.querySelector<HTMLButtonElement>('.tl-ap');
        if (target) target.focus();
        else focusPanel();
    });

    const setFiltros = (next: EmpleoFiltros) => {
        update((p) => writeEmpleoFiltros(p, next, activos));
        if (focusAfterFilters.current) {
            focusAfterFilters.current = false;
            focusPanel();
        }
    };
    const setVista = (next: ExploreVista) => update((p) => writeVista(p, 'empleo', next, explore.empleos.vista));

    const handlers = (p: DemoEmpleo) => ({
        ...cardLink(paths.publicacion(p.id)),
        onVerify: () => showVerification({ publicacion: p.id }),
    });

    const onDecide = (decision: DeckDecision, card: PublicationDeckCard) => {
        decide(actor.id, card.id, decision);
        if (decision === 'si') {
            // «Me interesa» abre la hoja de postulación (spec §3.1) en el detalle: postular es un acto real.
            go(postularPath(card.id));
            return;
        }
        setFocusEmpty(deck.length === 1);
        show({
            message: copy.empleos.noMeInteresa(card.title),
            action: {
                label: copy.empleos.deshacer,
                onAction: () => {
                    setFocusEmpty(false);
                    focusAfterUndo.current = true;
                    undoDecision(actor.id, card.id);
                },
            },
        });
    };

    /** «Volver a ver las descartadas»: deshace los «No me interesa» de lo que se ve con estos filtros. */
    const restoreDiscarded = () => {
        for (const p of filtered) if (decided(p.id) === 'no') undoDecision(actor.id, p.id);
        // El «Deshacer» del último «No me interesa» ya no deshace nada.
        hide();
        focusPanel();
    };

    const hasEmpleos = all.length > 0;

    let content;
    if (!hasEmpleos) {
        const vacio = explore.empleos.vacio;
        content = vacio ? <ExploreEmpty {...fromDemo(vacio, IconOffers, actor.id, go)} /> : null;
    } else if (filtered.length === 0) {
        content = (
            <ExploreEmpty
                icon={IconOffers}
                title={copy.empleos.sinResultados.titulo}
                text={copy.empleos.sinResultados.texto}
                action={{
                    label: copy.empleos.sinResultados.accion,
                    onClick: () => {
                        setFiltros(EMPLEO_SIN_FILTROS);
                        focusPanel();
                    },
                }}
            />
        );
    } else if (vista === 'deck' && deck.length > 0) {
        content = (
            <PublicationCardDeck
                ref={deckRef}
                cards={deck.map((p) => ({ id: p.id, ...publicationCard(p, handlers(p), { deck: true }) }))}
                onDecide={onDecide}
                cardMinHeight={cardMinHeight}
            />
        );
    } else if (vista === 'lista' && list.length > 0) {
        content = (
            <Stack gap={3}>
                {list.map((p) => (
                    <PublicationCard key={p.id} variant="compact" {...withState(publicationCard(p, handlers(p)), decided(p.id))} />
                ))}
            </Stack>
        );
    } else {
        content = <ExploreEmpty {...emptyDeck()} emptyRef={focusEmpty ? focusOnMount : undefined} />;
    }

    /** Ya no queda nada por ver en el deck o en la lista. */
    function emptyDeck(): ExploreEmptyProps {
        const titulo = vista === 'deck' ? copy.empleos.deckVacio.titulo : copy.empleos.listaVacia.titulo;
        if (hiddenByFilters > 0) {
            return {
                icon: IconOffers,
                title: titulo,
                text: copy.empleos.deckVacio.conFiltros(hiddenByFilters),
                action: {
                    label: copy.empleos.deckVacio.cambiarFiltros,
                    onClick: () => {
                        focusAfterFilters.current = true;
                        filtersSheet.show();
                    },
                },
            };
        }
        if (vista === 'deck' && list.length > 0) {
            return {
                icon: IconOffers,
                title: titulo,
                text: copy.empleos.deckVacio.sinFiltros,
                action: {
                    label: copy.empleos.deckVacio.verLista,
                    onClick: () => {
                        setVista('lista');
                        focusPanel();
                    },
                },
            };
        }
        // Todo lo que se ve con estos filtros quedó en «No me interesa».
        return {
            icon: IconOffers,
            title: titulo,
            text: copy.empleos.listaVacia.texto,
            action: { label: copy.empleos.listaVacia.verDescartadas, onClick: restoreDiscarded },
        };
    }

    return (
        <>
            <Stack gap={3} className="explore-fill">
                {hasEmpleos && (
                    <ExploreBar
                        text={explore.empleos.titulo}
                        toggleLabel={vista === 'deck' ? copy.empleos.verLista : copy.empleos.verDeAUna}
                        onToggle={() => setVista(vista === 'deck' ? 'lista' : 'deck')}
                    />
                )}
                {content}
            </Stack>

            {hasEmpleos && (
                <FiltersSheet
                    sheet={filtersSheet}
                    applied={filtros}
                    empty={EMPLEO_SIN_FILTROS}
                    onApply={setFiltros}
                    applyLabel={(d) => copy.filtros.verEmpleos(all.filter((p) => inView(p) && passesEmpleo(p, d)).length)}
                >
                    {(draft, setDraft) => (
                        <>
                            <ChipSection
                                label={copy.filtros.jornada}
                                options={JORNADAS.map((j) => ({ value: j, label: j }))}
                                value={draft.jornadas}
                                onChange={(jornadas) => setDraft({ ...draft, jornadas })}
                            />
                            <ChipSection
                                label={copy.filtros.contrato}
                                options={CONTRATOS.map((c) => ({ value: c, label: c }))}
                                value={draft.contratos}
                                onChange={(contratos) => setDraft({ ...draft, contratos })}
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
                                    label={copy.filtros.sueldoMin}
                                    help={copy.filtros.sueldoMinAyuda}
                                    value={draft.sueldoMin}
                                    onChange={(sueldoMin) => setDraft({ ...draft, sueldoMin })}
                                    unit="mes"
                                    onUnitChange={() => undefined}
                                    units={SUELDO_UNIDADES}
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
