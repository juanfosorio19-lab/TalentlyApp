// Pestaña Explorar (/explorar?tipo=empleo|turno|personas). Elige el segmento
// que aplica al actor (spec §5.2: Empleos · Turnos para quien trabaja o aún no
// tiene perfiles; Personas para una organización o un hogar con aviso activo)
// y muestra su panel: EXP-01, EXP-02 o EXP-05. El AppBar, la cabecera con el
// SegmentedControl y las hojas de la URL se dibujan una sola vez: cambiar de
// segmento solo cambia los chips y el panel (el foco sigue en la pestaña).
// Todo lo elegido (segmento, filtros, chips, vista y publicación) va en la URL
// con replace: la memoria de la pestaña y atrás vuelven a lo mismo, con su scroll.
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSheet } from '../../../app/sheets';
import { getExplore } from '../../demo/data';
import { useManageState } from '../../demo/manageState';
import { useDemoSession } from '../../demo/session';
import { useSessionState } from '../../demo/sessionStore';
import { ExploreLayout } from '../components/ExploreLayout';
import { useSheetKeepsScroll } from '../components/hooks';
import { VerificationSheet } from '../components/VerificationSheet';
import {
    countEmpleoFiltros,
    countPersonaFiltros,
    countTurnoFiltros,
    hasVistaAlias,
    normalizeVista,
    PARAM_PUBLICACION,
    PARAM_TIPO,
    readEmpleoFiltros,
    readPersonaFiltros,
    readTurnoFiltros,
    withParams,
    type Segment,
} from '../filters';
import { empleosOf, hasTurnos, ownPublications, personasFor, pickPublication, segmentFor, segmentsOf } from '../model';
import '../explore.css';
import { EmpleosScreen } from './EmpleosScreen';
import { PersonasChips, PersonasScreen } from './PersonasScreen';
import { TurnosChips, TurnosScreen } from './TurnosScreen';

/** La pestaña abre en EXP-01, EXP-02 o EXP-05 según el actor; cada panel lleva su id (data-screen-id). */
export const screenId = 'EXP-01';

export function ExploreScreen() {
    const { actor } = useDemoSession();
    // Otro actor parte de cero (otro foco, otras hojas); sus filtros siguen en la URL.
    return <ExploreTab key={actor.id} />;
}

function ExploreTab() {
    const { actor, recienRegistrado } = useDemoSession();
    const [params, setParams] = useSearchParams();
    const { applications } = useSessionState();
    // Pausar o cerrar en GES-01 saca la publicación de Personas (la misma sesión que GES-01 y GES-04).
    const manage = useManageState();
    const filtersSheet = useSheet('filtros');
    const panelRef = useRef<HTMLDivElement>(null);
    const focusPanel = useCallback(() => panelRef.current?.focus(), []);
    useSheetKeepsScroll();

    const explore = getExplore(actor.id);
    const segments = useMemo(() => segmentsOf(actor, recienRegistrado, manage), [actor, recienRegistrado, manage]);
    const segment = segmentFor(actor, segments, params.get(PARAM_TIPO));
    // Cambiar de segmento no apila historial; los filtros de cada segmento quedan en la URL (con su prefijo).
    // Una hoja que quedó en la URL (enlace a Filtros de un segmento sin nada que filtrar) no se abre sola en el otro.
    const onSegment = (next: Segment) =>
        setParams(
            (prev) =>
                withParams(prev, (p) => {
                    p.set(PARAM_TIPO, next);
                    p.delete('sheet');
                }),
            { replace: true },
        );

    // `vista=lista` sin prefijo (ONB-99) pasa a la clave del segmento: no queda colgado en la URL ni en la memoria de la pestaña.
    const vistaAlias = hasVistaAlias(params);
    const vistaFallback = segment === 'empleo' ? explore.empleos.vista : segment === 'personas' ? 'lista' : null;
    useEffect(() => {
        if (!vistaAlias) return;
        setParams((prev) => withParams(prev, (p) => normalizeVista(p, segment, vistaFallback)), {
            replace: true,
            preventScrollReset: true,
        });
    }, [vistaAlias, segment, vistaFallback, setParams]);

    // Botón Filtros del AppBar: solo si el segmento tiene algo que filtrar.
    let filterCount = 0;
    let canFilter = false;
    let chips = null;
    let panel;
    const panelProps = { filtersSheet, focusPanel };
    switch (segment) {
        case 'empleo':
            canFilter = empleosOf(explore).length > 0;
            filterCount = countEmpleoFiltros(readEmpleoFiltros(params, explore.filtrosActivos));
            panel = <EmpleosScreen {...panelProps} />;
            break;
        case 'turno':
            canFilter = hasTurnos(explore);
            filterCount = countTurnoFiltros(readTurnoFiltros(params, explore.filtrosActivos));
            chips = canFilter ? <TurnosChips /> : null;
            panel = <TurnosScreen {...panelProps} />;
            break;
        case 'personas': {
            const pubs = ownPublications(actor, recienRegistrado, manage);
            const pub = pickPublication(pubs, params.get(PARAM_PUBLICACION));
            canFilter = pub !== undefined && personasFor(actor, pub, applications, manage).tipo === 'sugeridas';
            filterCount = countPersonaFiltros(readPersonaFiltros(params));
            chips = pub ? <PersonasChips pubs={pubs} pub={pub} /> : null;
            panel = <PersonasScreen {...panelProps} />;
            break;
        }
    }

    // `?sheet=filtros` sin nada que filtrar (enlace, memoria de la pestaña): no hay hoja que mostrar; se quita.
    const strayFilters = filtersSheet.open && !canFilter;
    const hideFilters = filtersSheet.hide;
    useEffect(() => {
        if (strayFilters) hideFilters();
    }, [strayFilters, hideFilters]);

    return (
        <ExploreLayout
            segments={segments}
            segment={segment}
            onSegment={onSegment}
            filterCount={canFilter ? filterCount : 0}
            onFilters={canFilter ? () => filtersSheet.show() : undefined}
            chips={chips}
            panelRef={panelRef}
        >
            {panel}
            <VerificationSheet />
        </ExploreLayout>
    );
}
