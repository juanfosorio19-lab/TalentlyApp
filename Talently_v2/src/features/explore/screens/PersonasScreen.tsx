// EXP-05 · Explorar · Personas (/explorar?tipo=personas&p=:pubId&vista=lista|deck).
// Organización y hogar: personas sugeridas para cada publicación activa, con
// el selector de publicación arriba (Chip --menu que abre una hoja) y vista
// lista o deck con el mismo ActionPair. «Me interesa» invita a postular
// (Snackbar «Invitaste a Javiera a postular · Deshacer»); «No me interesa» la
// saca de las sugeridas. Nunca la edad. Si no hay a quién sugerir, un
// EmptyState honesto: cupos completos, ya postularon todas, o no hay
// publicaciones activas. Filtros EXP-06: nota mínima y «Solo quienes ya
// trabajaron contigo».
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { ExploreBar } from '../components/ExploreBar';
import { ExploreEmpty, type ExploreEmptyProps } from '../components/ExploreEmpty';
import { ExploreChips } from '../components/ExploreHead';
import { ExploreLayout, type SegmentScreenProps } from '../components/ExploreLayout';
import { ChipSection, FiltersSheet, useFiltersDraft } from '../components/FiltersSheet';
import { useDeckHeight } from '../components/useDeckHeight';
import { useLinks } from '../components/useLinks';
import { useVerificationSheet } from '../components/VerificationSheet';
import { copy } from '../copy';
import { explorarUrl, type ExploreVista } from '../explorePaths';
import { useRemembered } from '../memory';
import {
    countPersonaFiltros,
    formatNota,
    NOTAS,
    ownPublications,
    passesPersona,
    PERSONA_SIN_FILTROS,
    personasFor,
    personCard,
    type PersonaFiltros,
    type Suggestion,
} from '../model';

export const screenId = 'EXP-05';

export function PersonasScreen(props: SegmentScreenProps) {
    const { actor } = useDemoSession();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const links = useLinks();
    const { show } = useSnackbar();
    const [onVerify, verificationSheet] = useVerificationSheet();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [focusEmpty, setFocusEmpty] = useState(false);
    const deckRef = useRef<HTMLDivElement>(null);

    const pubs = useMemo(() => ownPublications(actor), [actor]);
    const pub = pubs.find((p) => p.id === params.get('p')) ?? pubs[0];
    const param = params.get('vista');
    const vista: ExploreVista = param === 'deck' || param === 'lista' ? param : 'lista';

    const [filtros, setFiltros] = useRemembered<PersonaFiltros>(`${actor.id}:personas:filtros`, () => PERSONA_SIN_FILTROS);
    // Lo decidido por publicación y persona («pubId/personId»).
    const [decididas, setDecididas] = useRemembered<Record<string, DeckDecision>>(`${actor.id}:personas:deck`, () => ({}));
    const sheet = useFiltersDraft(filtros, setFiltros);

    const estado = useMemo(() => (pub ? personasFor(actor, pub) : null), [actor, pub]);
    const sugeridas = estado?.tipo === 'sugeridas' ? estado.sugeridas : [];
    const keyOf = (s: Suggestion) => `${pub?.id}/${s.person.id}`;
    const filtered = sugeridas.filter((s) => passesPersona(s, filtros));
    const pending = filtered.filter((s) => !decididas[keyOf(s)]);
    const invitadas = sugeridas.filter((s) => decididas[keyOf(s)] === 'si').length;
    const draftCount = sugeridas.filter((s) => !decididas[keyOf(s)] && passesPersona(s, sheet.draft)).length;
    const cardMinHeight = useDeckHeight(deckRef, vista === 'deck' && pending.length > 0);
    const focusOnMount = useCallback((el: HTMLDivElement | null) => el?.focus(), []);

    const go = (next: { p?: string; vista?: ExploreVista }) =>
        navigate(explorarUrl({ tipo: 'personas', p: next.p ?? pub?.id, vista: next.vista ?? vista }), { replace: true });

    const decide = (decision: DeckDecision, s: Suggestion) => {
        const key = keyOf(s);
        setDecididas((prev) => ({ ...prev, [key]: decision }));
        setFocusEmpty(pending.length === 1);
        show({
            message: decision === 'si' ? copy.personas.invitaste(s.person.nombre) : copy.personas.descartaste(s.person.nombre),
            action: {
                label: copy.personas.deshacer,
                onAction: () => {
                    setFocusEmpty(false);
                    setDecididas((prev) => {
                        const next = { ...prev };
                        delete next[key];
                        return next;
                    });
                },
            },
        });
    };

    const cardData = (s: Suggestion, deck: boolean) => {
        const perfil = paths.perfilPublico(s.person.id, 'trabajo');
        return personCard(s, { href: links.href(perfil), onOpen: links.open(perfil), onVerify }, { deck });
    };

    const chips =
        pub && pubs.length > 0 ? (
            <ExploreChips label={copy.personas.publicacion}>
                <Chip variant="menu" icon={IconOffers} field={copy.personas.publicacion} onClick={() => setPickerOpen(true)}>
                    {pub.titulo}
                </Chip>
            </ExploreChips>
        ) : undefined;

    let content;
    let empty: ExploreEmptyProps | null = null;
    if (!pub || !estado) {
        empty = {
            icon: IconOffers,
            title: copy.personas.sinPublicaciones.titulo,
            text: copy.personas.sinPublicaciones.texto,
            action: { label: copy.personas.sinPublicaciones.accion, onClick: () => links.go(paths.inicio()) },
        };
    } else if (estado.tipo === 'completo') {
        empty = {
            icon: IconPeople,
            title: copy.personas.cuposCompletos.titulo,
            text: copy.personas.cuposCompletos.texto(pub.titulo, estado.total),
            action: pubs.length > 1 ? { label: copy.personas.cuposCompletos.accion, onClick: () => setPickerOpen(true) } : undefined,
        };
    } else if (estado.tipo === 'postularon') {
        empty = {
            icon: IconPeople,
            title: copy.personas.todosPostularon.titulo,
            text: copy.personas.todosPostularon.texto(pub.titulo, estado.postulados),
            action: { label: estado.accion, onClick: () => links.go(estado.revisar) },
        };
    } else if (filtered.length === 0) {
        empty = {
            icon: IconPeople,
            title: copy.personas.sinResultados.titulo,
            text: copy.personas.sinResultados.texto,
            action: { label: copy.personas.sinResultados.accion, onClick: () => setFiltros(PERSONA_SIN_FILTROS) },
        };
    } else if (pending.length === 0) {
        empty = {
            icon: IconPeople,
            title: copy.personas.revisasteTodas.titulo,
            text: copy.personas.revisasteTodas.texto(invitadas, pub.titulo),
        };
    } else if (vista === 'deck') {
        content = (
            <PublicationCardDeck
                ref={deckRef}
                cards={pending.map((s) => ({ id: s.person.id, subject: s.person.nombre, ...cardData(s, true) }))}
                onDecide={(decision, card) => {
                    const s = pending.find((x) => x.person.id === card.id);
                    if (s) decide(decision, s);
                }}
                cardMinHeight={cardMinHeight}
            />
        );
    } else {
        content = (
            <Stack gap={3}>
                {pending.map((s) => (
                    <PublicationCard
                        key={s.person.id}
                        {...cardData(s, false)}
                        cta={{ label: copy.personas.invitar, onClick: () => decide('si', s) }}
                    />
                ))}
            </Stack>
        );
    }

    const canFilter = estado?.tipo === 'sugeridas';

    return (
        <ExploreLayout
            {...props}
            chips={chips}
            filterCount={canFilter ? countPersonaFiltros(filtros) : 0}
            onFilters={canFilter ? sheet.openSheet : undefined}
        >
            <Stack gap={3} className="explore-fill">
                {pending.length > 0 && (
                    <ExploreBar
                        text={copy.personas.sugeridas(pending.length)}
                        toggleLabel={vista === 'deck' ? copy.personas.verLista : copy.personas.verDeAUna}
                        onToggle={() => go({ vista: vista === 'deck' ? 'lista' : 'deck' })}
                    />
                )}
                {empty ? <ExploreEmpty {...empty} emptyRef={focusEmpty ? focusOnMount : undefined} /> : content}
            </Stack>

            <FiltersSheet
                open={sheet.open}
                onClose={sheet.close}
                onClear={() => sheet.setDraft(PERSONA_SIN_FILTROS)}
                onApply={sheet.apply}
                applyLabel={copy.filtros.verPersonas(draftCount)}
            >
                <ChipSection
                    label={copy.filtros.nota}
                    single
                    options={NOTAS.map((n) => ({ value: n, label: copy.filtros.notaMinima(formatNota(n)) }))}
                    value={sheet.draft.nota === null ? [] : [sheet.draft.nota]}
                    onChange={([nota]) => sheet.setDraft({ ...sheet.draft, nota: nota ?? null })}
                />
                {actor.kind === 'organizacion' && (
                    <Switch
                        label={copy.filtros.yaTrabajaron}
                        description={copy.filtros.yaTrabajaronDesc}
                        checked={sheet.draft.yaTrabajaron}
                        onChange={(e) => sheet.setDraft({ ...sheet.draft, yaTrabajaron: e.target.checked })}
                    />
                )}
            </FiltersSheet>

            <SheetPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                title={copy.personas.elegirPublicacion}
                searchable={pubs.length > 6}
                options={pubs.map((p) => ({ value: p.id, label: p.titulo, description: getManagedPublication(p.id)?.resumen }))}
                value={pub?.id ?? null}
                onChange={(id) => go({ p: id })}
            />
            {verificationSheet}
        </ExploreLayout>
    );
}
