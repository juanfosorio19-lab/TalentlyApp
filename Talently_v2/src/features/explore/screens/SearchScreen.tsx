// EXP-07 · Buscar (/buscar?q=): se abre con la lupa del AppBar de Explorar.
// Busca en lo que el actor ve en Explorar (oficio, organización, comuna y
// datos clave, sin tildes) y agrupa por tipo: «Empleos (2)», «Turnos (3)», con
// PublicationCard compacta que abre DET-01. Lo escrito va en la URL (replace):
// atrás desde el detalle vuelve con la misma búsqueda. Una organización o un
// hogar no buscan empleos ni turnos: se les lleva a sus Personas sugeridas.
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGoBack } from '../../../app/BackButtonManager';
import { paths } from '../../../app/paths';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { EmptyState } from '../../../ui/EmptyState';
import { IconPeople, IconSearch } from '../../../ui/icons';
import { ScreenSection, Stack } from '../../../ui/Layout';
import { PublicationCard } from '../../../ui/PublicationCard';
import { SearchField } from '../../../ui/SearchField';
import { useDemoSession } from '../../demo/session';
import type { DemoPublication } from '../../demo/types';
import { useLinks } from '../components/useLinks';
import { useVerificationSheet } from '../components/VerificationSheet';
import { copy } from '../copy';
import { publicationCard, searchExplore, segmentsOf } from '../model';
import '../explore.css';

export const screenId = 'EXP-07';

export function SearchScreen() {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const { actor } = useDemoSession();
    const [params, setParams] = useSearchParams();
    const links = useLinks();
    const [onVerify, verificationSheet] = useVerificationSheet();

    // El texto vive en el campo (si esperara a la URL, que cambia en una transición, se perderían letras);
    // la URL lo guarda con replace para volver a la misma búsqueda.
    const [q, setQ] = useState(() => params.get('q') ?? '');
    const buscaTrabajo = segmentsOf(actor).some((s) => s === 'empleo' || s === 'turno');
    const results = useMemo(() => searchExplore(actor, q), [actor, q]);
    const total = results.empleos.length + results.turnos.length;

    const card = (p: DemoPublication) => {
        const detalle = paths.publicacion(p.id);
        return (
            <PublicationCard
                key={p.id}
                variant="compact"
                {...publicationCard(p, { href: links.href(detalle), onOpen: links.open(detalle), onVerify })}
            />
        );
    };

    let body;
    if (!buscaTrabajo) {
        body = (
            <div className="explore-empty">
                <EmptyState
                    icon={IconPeople}
                    title={copy.buscar.sinBusqueda.titulo}
                    text={copy.buscar.sinBusqueda.texto}
                    action={{ label: copy.buscar.sinBusqueda.accion, onClick: () => links.go(paths.explorar('personas')) }}
                />
            </div>
        );
    } else {
        body = (
            <>
                <SearchField
                    label={copy.buscar.campo}
                    placeholder={copy.buscar.placeholder}
                    value={q}
                    autoFocus={!q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        setParams(e.target.value ? { q: e.target.value } : {}, { replace: true });
                    }}
                />
                {!q.trim() ? (
                    <div className="explore-empty">
                        <EmptyState icon={IconSearch} title={copy.buscar.inicio.titulo} text={copy.buscar.inicio.texto} />
                    </div>
                ) : total === 0 ? (
                    <div className="explore-empty">
                        <EmptyState
                            icon={IconSearch}
                            title={copy.buscar.sinResultados.titulo(q.trim())}
                            text={copy.buscar.sinResultados.texto}
                        />
                    </div>
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
                    </>
                )}
            </>
        );
    }

    return (
        <div className="tl-app-screen" data-screen-id={screenId}>
            <AppBar variant="standard" title={copy.buscar.titulo} onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body explore-main">
                <div className="tl-app-screen__content explore-panel">{body}</div>
            </main>
            {verificationSheet}
        </div>
    );
}
