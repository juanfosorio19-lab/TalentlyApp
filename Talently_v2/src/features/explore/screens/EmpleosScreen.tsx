// EXP-01 · Explorar · Empleos (/explorar?tipo=empleo&vista=deck|lista).
// Deck de publicaciones (PublicationCardDeck) con «Ver lista» arriba a la
// derecha; la lista usa PublicationCard compacta (EXP-01-lista). «Me interesa»
// y «No me interesa» sacan la tarjeta del deck con Snackbar «Deshacer»; lo
// marcado con «No me interesa» tampoco aparece en la lista. Tocar la tarjeta
// abre DET-01 (/p/:id) con push. Filtros EXP-06: jornada, contrato, distancia
// y «Solo organizaciones verificadas».
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paths } from '../../../app/paths';
import { IconOffers } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { PublicationCard } from '../../../ui/PublicationCard';
import { PublicationCardDeck, type DeckDecision, type PublicationDeckCard } from '../../../ui/PublicationCardDeck';
import { useSnackbar } from '../../../ui/Snackbar';
import { Switch } from '../../../ui/Switch';
import { getExplore } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import type { DemoEmpleo } from '../../demo/types';
import { ExploreBar } from '../components/ExploreBar';
import { ExploreEmpty, fromDemo, type ExploreEmptyProps } from '../components/ExploreEmpty';
import { ExploreLayout, type SegmentScreenProps } from '../components/ExploreLayout';
import { ChipSection, FiltersSheet, useFiltersDraft } from '../components/FiltersSheet';
import { useDeckHeight } from '../components/useDeckHeight';
import { useLinks } from '../components/useLinks';
import { useVerificationSheet } from '../components/VerificationSheet';
import { copy } from '../copy';
import { explorarUrl, type ExploreVista } from '../explorePaths';
import { useRemembered } from '../memory';
import {
    CONTRATOS,
    countEmpleoFiltros,
    defaultEmpleoFiltros,
    DISTANCIAS,
    EMPLEO_SIN_FILTROS,
    empleosOf,
    JORNADAS,
    passesEmpleo,
    publicationCard,
    type EmpleoFiltros,
} from '../model';

export const screenId = 'EXP-01';

export function EmpleosScreen(props: SegmentScreenProps) {
    const { actor } = useDemoSession();
    const explore = getExplore(actor.id);
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const links = useLinks();
    const { show } = useSnackbar();
    const [onVerify, verificationSheet] = useVerificationSheet();
    const deckRef = useRef<HTMLDivElement>(null);

    const all = useMemo(() => empleosOf(explore), [explore]);
    const [filtros, setFiltros] = useRemembered<EmpleoFiltros>(`${actor.id}:empleo:filtros`, () =>
        defaultEmpleoFiltros(explore.filtrosActivos),
    );
    // Lo decidido en el deck, por publicación.
    const [decididas, setDecididas] = useRemembered<Record<string, DeckDecision>>(`${actor.id}:empleo:deck`, () => ({}));
    const sheet = useFiltersDraft(filtros, setFiltros);
    // Al decidir la última tarjeta, el foco pasa al EmptyState (README del deck).
    const [focusEmpty, setFocusEmpty] = useState(false);

    const param = params.get('vista');
    const vista: ExploreVista = param === 'deck' || param === 'lista' ? param : explore.empleos.vista;
    const filtered = all.filter((p) => passesEmpleo(p, filtros));
    const deck = filtered.filter((p) => !decididas[p.id]);
    const list = filtered.filter((p) => decididas[p.id] !== 'no');
    // Lo que la vista actual mostraría sin filtros: en el deck, lo no decidido; en la lista, todo menos «No me interesa».
    const inView = (p: DemoEmpleo) => (vista === 'deck' ? !decididas[p.id] : decididas[p.id] !== 'no');
    const hiddenByFilters = all.filter((p) => inView(p) && !passesEmpleo(p, filtros)).length;
    const cardMinHeight = useDeckHeight(deckRef, vista === 'deck' && deck.length > 0);

    const setVista = (next: ExploreVista) => navigate(explorarUrl({ tipo: 'empleo', vista: next }), { replace: true });
    const toggleVista = () => setVista(vista === 'deck' ? 'lista' : 'deck');

    const handlers = (p: DemoEmpleo) => ({
        href: links.href(paths.publicacion(p.id)),
        onOpen: links.open(paths.publicacion(p.id)),
        onVerify,
    });

    const onDecide = (decision: DeckDecision, card: PublicationDeckCard) => {
        setDecididas((prev) => ({ ...prev, [card.id]: decision }));
        setFocusEmpty(deck.length === 1);
        show({
            message: decision === 'si' ? copy.empleos.meInteresa(card.title) : copy.empleos.noMeInteresa(card.title),
            action: {
                label: copy.empleos.deshacer,
                onAction: () => {
                    setFocusEmpty(false);
                    setDecididas((prev) => {
                        const next = { ...prev };
                        delete next[card.id];
                        return next;
                    });
                },
            },
        });
    };

    const draftCount = all.filter((p) => inView(p) && passesEmpleo(p, sheet.draft)).length;
    const focusOnMount = useCallback((el: HTMLDivElement | null) => el?.focus(), []);
    const hasEmpleos = all.length > 0;

    let content;
    if (!hasEmpleos) {
        const vacio = explore.empleos.vacio;
        content = vacio ? <ExploreEmpty {...fromDemo(vacio, IconOffers, links.go)} /> : null;
    } else if (filtered.length === 0) {
        content = (
            <ExploreEmpty
                icon={IconOffers}
                title={copy.empleos.sinResultados.titulo}
                text={copy.empleos.sinResultados.texto}
                action={{ label: copy.empleos.sinResultados.accion, onClick: () => setFiltros(EMPLEO_SIN_FILTROS) }}
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
                    <PublicationCard key={p.id} variant="compact" {...publicationCard(p, handlers(p))} />
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
                action: { label: copy.empleos.deckVacio.cambiarFiltros, onClick: sheet.openSheet },
            };
        }
        if (vista === 'deck' && list.length > 0) {
            return {
                icon: IconOffers,
                title: titulo,
                text: copy.empleos.deckVacio.sinFiltros,
                action: { label: copy.empleos.deckVacio.verLista, onClick: () => setVista('lista') },
            };
        }
        return { icon: IconOffers, title: titulo, text: copy.empleos.listaVacia.texto };
    }

    return (
        <ExploreLayout
            {...props}
            filterCount={hasEmpleos ? countEmpleoFiltros(filtros) : 0}
            onFilters={hasEmpleos ? sheet.openSheet : undefined}
        >
            <Stack gap={3} className="explore-fill">
                {hasEmpleos && (
                    <ExploreBar
                        text={explore.empleos.titulo}
                        toggleLabel={vista === 'deck' ? copy.empleos.verLista : copy.empleos.verDeAUna}
                        onToggle={toggleVista}
                    />
                )}
                {content}
            </Stack>

            <FiltersSheet
                open={sheet.open}
                onClose={sheet.close}
                onClear={() => sheet.setDraft(EMPLEO_SIN_FILTROS)}
                onApply={sheet.apply}
                applyLabel={copy.filtros.verEmpleos(draftCount)}
            >
                <ChipSection
                    label={copy.filtros.jornada}
                    options={JORNADAS.map((j) => ({ value: j, label: j }))}
                    value={sheet.draft.jornadas}
                    onChange={(jornadas) => sheet.setDraft({ ...sheet.draft, jornadas })}
                />
                <ChipSection
                    label={copy.filtros.contrato}
                    options={CONTRATOS.map((c) => ({ value: c, label: c }))}
                    value={sheet.draft.contratos}
                    onChange={(contratos) => sheet.setDraft({ ...sheet.draft, contratos })}
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
            {verificationSheet}
        </ExploreLayout>
    );
}
