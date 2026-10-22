// EXP-07 · Buscar (/buscar?q=): se abre con la lupa del AppBar de Explorar.
// Busca en lo que el actor ve en Explorar, sin tildes y con sinónimos
// («nana» encuentra «Asesor/a del hogar»): empleos y turnos para quien
// trabaja; personas sugeridas para una organización o un hogar (por nombre,
// oficio o comuna). Agrupa por tipo: «Empleos (2)», «Turnos (3)», «Personas
// sugeridas (4)», con PublicationCard compacta que abre DET-01 o el perfil.
// Lo escrito va en la URL (replace): atrás desde el detalle vuelve con la
// misma búsqueda. Si el actor no tiene nada que buscar (sin perfiles), el
// EmptyState de la demo con su acción real. Sin historial (enlace directo o
// recarga), volver lleva a Explorar, de donde sale la búsqueda.
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGoBack } from '../../../app/BackButtonManager';
import { hasInternalHistory } from '../../../app/navigation/backHandlers';
import { lastUrlOf } from '../../../app/navigation/tabMemory';
import { paths } from '../../../app/paths';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { IconAdd, IconOffers, IconSearch } from '../../../ui/icons';
import { ScreenSection, Stack } from '../../../ui/Layout';
import { PublicationCard } from '../../../ui/PublicationCard';
import { SearchField } from '../../../ui/SearchField';
import { getExplore } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import type { DemoPublication } from '../../demo/types';
import { ExploreEmpty, fromDemo } from '../components/ExploreEmpty';
import { useGo, useSheetKeepsScroll } from '../components/hooks';
import { useShowVerification, VerificationSheet } from '../components/VerificationSheet';
import { copy } from '../copy';
import { isEmptyScope, personCard, publicationCard, searchHints, searchIn, searchScope, segmentsOf, type Suggestion } from '../model';
import '../explore.css';

export const screenId = 'EXP-07';

type Alcance = 'trabajo' | 'personas' | 'todo';

export function SearchScreen() {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const { actor, recienRegistrado } = useDemoSession();
    const [params, setParams] = useSearchParams();
    const { go, cardLink } = useGo();
    const showVerification = useShowVerification();
    useSheetKeepsScroll();

    // El texto vive en el campo (si esperara a la URL, que cambia en una transición, se perderían letras);
    // la URL lo guarda con replace para volver a la misma búsqueda.
    const [q, setQ] = useState(() => params.get('q') ?? '');
    const scope = useMemo(() => searchScope(actor, recienRegistrado), [actor, recienRegistrado]);
    const results = useMemo(() => searchIn(scope, q), [scope, q]);
    const hints = useMemo(() => searchHints(scope), [scope]);
    const total = results.empleos.length + results.turnos.length + results.personas.length;
    const trabajo = scope.empleos.length + scope.turnos.length > 0;
    const alcance: Alcance = trabajo && scope.personas.length > 0 ? 'todo' : trabajo ? 'trabajo' : 'personas';

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
            {...personCard(s, {
                ...cardLink(paths.perfilPublico(s.person.id, 'trabajo')),
                onVerify: () => showVerification({ persona: s.person.id }),
            })}
        />
    );

    let body;
    if (isEmptyScope(scope)) {
        // Nada que buscar todavía: qué hacer para tenerlo. Quien contrata, publicar; Rosa sin perfiles, agregar uno.
        const vacio = getExplore(actor.id).empleos.vacio;
        if (segmentsOf(actor, recienRegistrado).includes('personas')) {
            body = (
                <ExploreEmpty
                    icon={IconOffers}
                    title={copy.personas.sinPublicaciones.titulo}
                    text={copy.personas.sinPublicaciones.texto}
                    action={{ label: copy.personas.sinPublicaciones.accion, onClick: () => go(paths.inicio()) }}
                />
            );
        } else body = vacio ? <ExploreEmpty {...fromDemo(vacio, IconAdd, actor.id, go)} /> : null;
    } else {
        const inicio = copy.buscar.inicio[alcance];
        body = (
            <>
                <SearchField
                    label={copy.buscar.campo[alcance]}
                    placeholder={copy.buscar.placeholder[alcance]}
                    value={q}
                    autoFocus={!q}
                    onChange={(e) => {
                        const next = e.target.value;
                        setQ(next);
                        setParams(next ? { q: next } : {}, { replace: true, preventScrollReset: true });
                    }}
                />
                {!q.trim() ? (
                    <ExploreEmpty icon={IconSearch} title={inicio.titulo} text={inicio.texto} />
                ) : total === 0 ? (
                    <ExploreEmpty icon={IconSearch} title={copy.buscar.sinResultados.titulo(q.trim())} text={copy.buscar.sinResultados.texto(hints)} />
                ) : (
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
                )}
            </>
        );
    }

    return (
        <div className="tl-app-screen" data-screen-id={screenId}>
            <AppBar variant="standard" title={copy.buscar.titulo} onBack={onBack} scrolled={scrolled} />
            <main className="tl-app-screen__body explore-main">
                <div className="tl-app-screen__content explore-panel">{body}</div>
            </main>
            <VerificationSheet />
        </div>
    );
}
