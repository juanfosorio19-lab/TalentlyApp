// EXP-07 · Buscar (/buscar?q=): se abre con la lupa del AppBar de Explorar.
// Búsqueda global (spec §5.4): todos los empleos y turnos activos (primero
// los de su Explorar) y, para quien contrata, las personas que calzan con sus
// publicaciones (por nombre, oficio o comuna). Sin tildes y con sinónimos:
// «nana» encuentra «Asesor/a del hogar» y «Cuidador/a infantil», y bajo el
// buscador aparecen esos oficios como Chips de sugerencia (el sinónimo nunca
// se muestra). Agrupa por tipo: «Empleos (2)», «Turnos (3)», «Personas (4)»,
// con PublicationCard compacta: una publicación abre DET-01; una persona,
// GES-02 o GES-04 si ya postuló, o EXP-05 de la publicación para invitarla.
// Lo escrito va en la URL (replace): atrás desde el detalle vuelve con la
// misma búsqueda. Rosa sin perfiles ve, bajo el buscador, su EmptyState con
// «Agregar un perfil». Sin historial (enlace directo o recarga), volver lleva
// a Explorar, de donde sale la búsqueda.
import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGoBack } from '../../../app/BackButtonManager';
import { hasInternalHistory } from '../../../app/navigation/backHandlers';
import { lastUrlOf } from '../../../app/navigation/tabMemory';
import { paths } from '../../../app/paths';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Chip } from '../../../ui/Chip';
import { IconAdd, IconSearch } from '../../../ui/icons';
import { ScreenSection, Stack } from '../../../ui/Layout';
import { PublicationCard } from '../../../ui/PublicationCard';
import { SearchField } from '../../../ui/SearchField';
import { getExplore } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import { useSessionState } from '../../demo/sessionStore';
import type { DemoPublication } from '../../demo/types';
import { ExploreEmpty, fromDemo } from '../components/ExploreEmpty';
import { useGo, useSheetKeepsScroll } from '../components/hooks';
import { useShowVerification, VerificationSheet } from '../components/VerificationSheet';
import { copy } from '../copy';
import {
    personCard,
    publicationCard,
    searchHints,
    searchIn,
    searchScope,
    suggestionPath,
    synonymSuggestions,
    type Suggestion,
} from '../model';
import '../explore.css';

export const screenId = 'EXP-07';

type Alcance = 'trabajo' | 'todo';

export function SearchScreen() {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const { actor, recienRegistrado } = useDemoSession();
    const [params, setParams] = useSearchParams();
    const { go, cardLink } = useGo();
    const showVerification = useShowVerification();
    // Quién ya postuló (personas); también vuelve a pintar las insignias cuando alguien verifica su celular (AUTH-08).
    const { applications } = useSessionState();
    useSheetKeepsScroll();

    // El texto vive en el campo (si esperara a la URL, que cambia en una transición, se perderían letras);
    // la URL lo guarda con replace para volver a la misma búsqueda.
    const [q, setQ] = useState(() => params.get('q') ?? '');
    const scope = useMemo(() => searchScope(actor, recienRegistrado, applications), [actor, recienRegistrado, applications]);
    const results = useMemo(() => searchIn(scope, q), [scope, q]);
    const hints = useMemo(() => searchHints(scope), [scope]);
    const sugerencias = synonymSuggestions(q);
    const total = results.empleos.length + results.turnos.length + results.personas.length;
    const alcance: Alcance = scope.personas.length > 0 ? 'todo' : 'trabajo';
    // Rosa sin perfiles: busca igual, pero antes de escribir ve cómo empezar.
    const sinPerfiles = actor.kind === 'persona' && actor.capabilities.length === 0;
    const vacio = sinPerfiles ? getExplore(actor.id).empleos.vacio : undefined;

    const inputRef = useRef<HTMLInputElement>(null);
    const write = (next: string) => {
        setQ(next);
        setParams(next ? { q: next } : {}, { replace: true, preventScrollReset: true });
    };
    /** Chip de sugerencia: escribe el oficio en el campo. El chip se va con el sinónimo: el foco vuelve al campo. */
    const suggest = (oficio: string) => {
        write(oficio);
        inputRef.current?.focus();
    };

    // Sin historial interno, el atrás del AppBar vuelve a Explorar (no a Inicio).
    const onBack = () => (hasInternalHistory() ? goBack() : go(lastUrlOf('explorar')));

    const card = (p: DemoPublication) => {
        const detalle = paths.publicacion(p.id);
        return (
            <PublicationCard
                key={p.id}
                variant="compact"
                {...publicationCard(p, { ...cardLink(detalle), onVerify: () => showVerification({ publicacion: p.id }) })}
            />
        );
    };
    const personItem = (s: Suggestion) => (
        <PublicationCard
            key={s.person.id}
            variant="compact"
            {...personCard(
                s,
                { ...cardLink(suggestionPath(s)), onVerify: () => showVerification({ persona: s.person.id }) },
                { publicacion: true },
            )}
        />
    );

    const inicio = copy.buscar.inicio[alcance];
    let below;
    if (!q.trim()) {
        below = vacio ? (
            <ExploreEmpty {...fromDemo(vacio, IconAdd, actor.id, go)} />
        ) : (
            <ExploreEmpty icon={IconSearch} title={inicio.titulo} text={inicio.texto} />
        );
    } else if (total === 0) {
        below = (
            <ExploreEmpty icon={IconSearch} title={copy.buscar.sinResultados.titulo(q.trim())} text={copy.buscar.sinResultados.texto(hints)} />
        );
    } else {
        below = (
            <>
                {results.empleos.length > 0 && (
                    <ScreenSection title={copy.buscar.empleos(results.empleos.length)}>
                        <Stack gap={3}>{results.empleos.map(card)}</Stack>
                    </ScreenSection>
                )}
                {results.turnos.length > 0 && (
                    <ScreenSection title={copy.buscar.turnos(results.turnos.length)}>
                        <Stack gap={3}>{results.turnos.map(card)}</Stack>
                    </ScreenSection>
                )}
                {results.personas.length > 0 && (
                    <ScreenSection title={copy.buscar.personas(results.personas.length)}>
                        <Stack gap={3}>{results.personas.map(personItem)}</Stack>
                    </ScreenSection>
                )}
            </>
        );
    }

    return (
        <div className="tl-app-screen" data-screen-id={screenId}>
            <AppBar variant="standard" title={copy.buscar.titulo} onBack={onBack} scrolled={scrolled} />
            <main className="tl-app-screen__body explore-main">
                <div className="tl-app-screen__content explore-panel">
                    <Stack gap={3}>
                        <SearchField
                            ref={inputRef}
                            label={copy.buscar.campo[alcance]}
                            placeholder={copy.buscar.placeholder[alcance]}
                            value={q}
                            autoFocus={!q}
                            onChange={(e) => write(e.target.value)}
                        />
                        {sugerencias.length > 0 && (
                            <div className="tl-chipgroup__chips" role="group" aria-label={copy.buscar.sugerencias}>
                                {sugerencias.map((oficio) => (
                                    <Chip key={oficio} variant="suggestion" onClick={() => suggest(oficio)}>
                                        {oficio}
                                    </Chip>
                                ))}
                            </div>
                        )}
                    </Stack>
                    {below}
                </div>
            </main>
            <VerificationSheet />
        </div>
    );
}
