// EXP-05 · Explorar · Personas (/explorar?tipo=personas&p=:pubId).
// Organización y hogar: personas sugeridas para cada publicación activa, con
// el selector de publicación arriba (PersonasChips: Chip --menu que abre
// `?sheet=publicacion`) y vista lista o deck con el mismo ActionPair. «Me
// interesa» invita a postular (Snackbar «Invitaste a Javiera a postular ·
// Deshacer»); «No me interesa» la saca de las sugeridas. Lo decidido vive en
// demo/sessionStore. Nunca la edad. Quienes ya están en la publicación y la
// cifra de postulados salen de la sesión (como en GES-02 y GES-04). Si no hay
// a quién sugerir, un EmptyState con una acción real: cupos completos, ya
// postularon todas, revisaste a todas o no hay publicaciones activas.
// Filtros EXP-06: nota mínima y «Solo quienes ya trabajaron contigo».
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSheet } from '../../../app/sheets';
import { paths } from '../../../app/paths';
import { Chip } from '../../../ui/Chip';
import { IconOffers, IconPeople } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { PublicationCard } from '../../../ui/PublicationCard';
import { PublicationCardDeck, type DeckDecision } from '../../../ui/PublicationCardDeck';
import { SheetPicker } from '../../../ui/SheetPicker';
import { useSnackbar } from '../../../ui/Snackbar';
import { Switch } from '../../../ui/Switch';
import { getManagedPublication } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import { decide, undoDecision, useDecided, useSessionState } from '../../demo/sessionStore';
import type { DemoPublication } from '../../demo/types';
import { ExploreBar } from '../components/ExploreBar';
import { ExploreEmpty, type ExploreEmptyProps } from '../components/ExploreEmpty';
import { ExploreChips, type SegmentPanelProps } from '../components/ExploreLayout';
import { ChipSection, FiltersSheet } from '../components/FiltersSheet';
import { useExploreParams, useGo } from '../components/hooks';
import { useCommitOnClose } from '../components/useCommitOnClose';
import { useDeckHeight } from '../components/useDeckHeight';
import { useShowVerification } from '../components/VerificationSheet';
import { copy } from '../copy';
import {
    formatNota,
    NOTAS,
    PARAM_PUBLICACION,
    PERSONA_SIN_FILTROS,
    readPersonaFiltros,
    readVista,
    writePersonaFiltros,
    writeVista,
    type ExploreVista,
    type PersonaFiltros,
} from '../filters';
import {
    ownPublications,
    passesPersona,
    personasFor,
    personCard,
    pickPublication,
    reviewPathOf,
    suggestionId,
    type Suggestion,
} from '../model';

export const screenId = 'EXP-05';

const PUBLICATION_SHEET = 'publicacion';

/** Selector de publicación (Chip --menu) en la cabecera fija; la hoja cambia `?p=` al cerrarse. */
export function PersonasChips({ pubs, pub }: { pubs: readonly DemoPublication[]; pub: DemoPublication }) {
    const [, update] = useExploreParams();
    const pubSheet = useSheet(PUBLICATION_SHEET);
    const choose = useCommitOnClose(
        pubSheet.open,
        useCallback((id: string) => update((p) => p.set(PARAM_PUBLICACION, id)), [update]),
    );
    return (
        <>
            <ExploreChips label={copy.personas.publicacion}>
                <Chip variant="menu" icon={IconOffers} field={copy.personas.publicacion} aria-haspopup="dialog" onClick={() => pubSheet.show()}>
                    {pub.titulo}
                </Chip>
            </ExploreChips>
            <SheetPicker
                open={pubSheet.open}
                onClose={pubSheet.hide}
                title={copy.personas.elegirPublicacion}
                searchable={pubs.length > 6}
                options={pubs.map((p) => ({ value: p.id, label: p.titulo, description: getManagedPublication(p.id)?.resumen }))}
                value={pub.id}
                onChange={choose}
            />
        </>
    );
}

export function PersonasScreen({ filtersSheet, focusPanel }: SegmentPanelProps) {
    const { actor, recienRegistrado } = useDemoSession();
    const [params, update] = useExploreParams();
    const { go, cardLink } = useGo();
    const { show } = useSnackbar();
    const showVerification = useShowVerification();
    const pubSheet = useSheet(PUBLICATION_SHEET);
    const decided = useDecided(actor.id);
    // También vuelve a pintar las insignias cuando alguien verifica su celular (AUTH-08).
    const { applications } = useSessionState();
    const deckRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [focusEmpty, setFocusEmpty] = useState(false);
    // Al invitar desde la lista la tarjeta sale: el foco pasa al CTA de la que queda en su lugar.
    const focusNext = useRef<string | null>(null);
    // «Deshacer»: la persona vuelve y el EmptyState que tenía el foco se va (deck: su ActionPair; lista: su CTA).
    const focusAfterUndo = useRef<{ from: 'deck' | 'lista'; personId: string } | null>(null);

    const pubs = useMemo(() => ownPublications(actor, recienRegistrado), [actor, recienRegistrado]);
    const pub = pickPublication(pubs, params.get(PARAM_PUBLICACION));
    const vista = readVista(params, 'personas', 'lista');
    const filtros = readPersonaFiltros(params);

    const estado = useMemo(() => (pub ? personasFor(actor, pub, applications) : null), [actor, pub, applications]);
    const sugeridas = estado?.tipo === 'sugeridas' ? estado.sugeridas : [];
    const decisionOf = (s: Suggestion) => (pub ? decided(suggestionId(pub.id, s.person.id)) : undefined);
    const filtered = sugeridas.filter((s) => passesPersona(s, filtros));
    const pending = filtered.filter((s) => !decisionOf(s));
    const invitadas = sugeridas.filter((s) => decisionOf(s) === 'si').length;
    const cardMinHeight = useDeckHeight(deckRef, vista === 'deck' && pending.length > 0);
    const focusOnMount = useCallback((el: HTMLDivElement | null) => el?.focus(), []);

    const ctaOf = (personId: string) =>
        listRef.current?.querySelector<HTMLElement>(`[data-sugerida="${CSS.escape(personId)}"] .tl-pub__cta button`);

    useEffect(() => {
        const id = focusNext.current;
        if (!id) return;
        focusNext.current = null;
        ctaOf(id)?.focus();
    });

    useEffect(() => {
        const undo = focusAfterUndo.current;
        if (!undo) return;
        focusAfterUndo.current = null;
        const active = document.activeElement;
        if (active instanceof HTMLElement && active !== document.body && active.isConnected) return;
        const target = undo.from === 'deck' ? deckRef.current?.querySelector<HTMLElement>('.tl-ap') : ctaOf(undo.personId);
        if (target) target.focus();
        else focusPanel();
    });

    const setFiltros = useCallback((next: PersonaFiltros) => update((p) => writePersonaFiltros(p, next)), [update]);
    const setVista = (next: ExploreVista) => update((p) => writeVista(p, 'personas', next, 'lista'));

    const onDecision = (decision: DeckDecision, s: Suggestion, from: 'deck' | 'lista') => {
        if (!pub) return;
        const id = suggestionId(pub.id, s.person.id);
        const i = pending.indexOf(s);
        const neighbor = pending[i + 1] ?? pending[i - 1];
        decide(actor.id, id, decision);
        setFocusEmpty(pending.length === 1);
        if (from === 'lista' && neighbor) focusNext.current = neighbor.person.id;
        show({
            message: decision === 'si' ? copy.personas.invitaste(s.person.nombre) : copy.personas.descartaste(s.person.nombre),
            action: {
                label: copy.personas.deshacer,
                onAction: () => {
                    setFocusEmpty(false);
                    focusAfterUndo.current = { from, personId: s.person.id };
                    undoDecision(actor.id, id);
                },
            },
        });
    };

    const cardData = (s: Suggestion, deck: boolean) =>
        personCard(
            s,
            { ...cardLink(paths.perfilPublico(s.person.id, 'trabajo')), onVerify: () => showVerification({ persona: s.person.id }) },
            { deck },
        );

    /** Otra publicación (si hay) o revisar a quienes ya están en esta (sus cupos o quienes postularon). */
    const nextStep = (p: DemoPublication, ver: 'postulados' | 'confirmados'): ExploreEmptyProps['action'] => {
        if (pubs.length > 1) return { label: copy.personas.cambiarPublicacion, onClick: () => pubSheet.show() };
        const review = reviewPathOf(p, applications, ver);
        return { label: review.label, onClick: () => go(review.path) };
    };

    let content;
    let empty: ExploreEmptyProps | null = null;
    if (!pub || !estado) {
        empty = {
            icon: IconOffers,
            title: copy.personas.sinPublicaciones.titulo,
            text: copy.personas.sinPublicaciones.texto,
            action: { label: copy.personas.sinPublicaciones.accion, onClick: () => go(paths.inicio()) },
        };
    } else if (estado.tipo === 'completo') {
        empty = {
            icon: IconPeople,
            title: copy.personas.cuposCompletos.titulo,
            text: copy.personas.cuposCompletos.texto(pub.titulo, estado.total),
            action: nextStep(pub, 'confirmados'),
        };
    } else if (estado.tipo === 'nadie') {
        empty = {
            icon: IconPeople,
            title: copy.personas.nadie.titulo,
            text: copy.personas.nadie.texto(pub.titulo),
            action: pubs.length > 1 ? nextStep(pub, 'postulados') : undefined,
        };
    } else if (estado.tipo === 'postularon') {
        const review = reviewPathOf(pub, applications, 'postulados');
        empty = {
            icon: IconPeople,
            title: copy.personas.todosPostularon.titulo,
            text: copy.personas.todosPostularon.texto(pub.titulo, estado.postulados),
            action: { label: review.label, onClick: () => go(review.path) },
        };
    } else if (filtered.length === 0) {
        empty = {
            icon: IconPeople,
            title: copy.personas.sinResultados.titulo,
            text: copy.personas.sinResultados.texto,
            action: {
                label: copy.personas.sinResultados.accion,
                onClick: () => {
                    setFiltros(PERSONA_SIN_FILTROS);
                    focusPanel();
                },
            },
        };
    } else if (pending.length === 0) {
        empty = {
            icon: IconPeople,
            title: copy.personas.revisasteTodas.titulo,
            text: copy.personas.revisasteTodas.texto(invitadas, pub.titulo),
            action: nextStep(pub, 'postulados'),
        };
    } else if (vista === 'deck') {
        content = (
            <PublicationCardDeck
                ref={deckRef}
                cards={pending.map((s) => ({ id: s.person.id, subject: s.person.nombre, ...cardData(s, true) }))}
                onDecide={(decision, card) => {
                    const s = pending.find((x) => x.person.id === card.id);
                    if (s) onDecision(decision, s, 'deck');
                }}
                cardMinHeight={cardMinHeight}
            />
        );
    } else {
        content = (
            <Stack gap={3} ref={listRef}>
                {pending.map((s) => (
                    <PublicationCard
                        key={s.person.id}
                        data-sugerida={s.person.id}
                        {...cardData(s, false)}
                        cta={{ label: copy.personas.invitar, onClick: () => onDecision('si', s, 'lista') }}
                    />
                ))}
            </Stack>
        );
    }

    return (
        <>
            <Stack gap={3} className="explore-fill">
                {pending.length > 0 && (
                    <ExploreBar
                        text={copy.personas.sugeridas(pending.length)}
                        toggleLabel={vista === 'deck' ? copy.personas.verLista : copy.personas.verDeAUna}
                        onToggle={() => setVista(vista === 'deck' ? 'lista' : 'deck')}
                    />
                )}
                {empty ? <ExploreEmpty {...empty} emptyRef={focusEmpty ? focusOnMount : undefined} /> : content}
            </Stack>

            {estado?.tipo === 'sugeridas' && (
                <FiltersSheet
                    sheet={filtersSheet}
                    applied={filtros}
                    empty={PERSONA_SIN_FILTROS}
                    onApply={setFiltros}
                    applyLabel={(d) => copy.filtros.verPersonas(sugeridas.filter((s) => !decisionOf(s) && passesPersona(s, d)).length)}
                >
                    {(draft, setDraft) => (
                        <>
                            <ChipSection
                                label={copy.filtros.nota}
                                single
                                options={NOTAS.map((n) => ({ value: n, label: copy.filtros.notaMinima(formatNota(n)) }))}
                                value={draft.nota === null ? [] : [draft.nota]}
                                onChange={([nota]) => setDraft({ ...draft, nota: nota ?? null })}
                            />
                            {actor.kind === 'organizacion' && (
                                <Switch
                                    label={copy.filtros.yaTrabajaron}
                                    description={copy.filtros.yaTrabajaronDesc}
                                    checked={draft.yaTrabajaron}
                                    onChange={(e) => setDraft({ ...draft, yaTrabajaron: e.target.checked })}
                                />
                            )}
                        </>
                    )}
                </FiltersSheet>
            )}
        </>
    );
}
