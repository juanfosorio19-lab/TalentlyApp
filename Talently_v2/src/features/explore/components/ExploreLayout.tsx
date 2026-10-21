// Armazón común de los segmentos de Explorar: AppBar large (Buscar, Filtros
// con contador y la campana), la cabecera fija con el SegmentedControl y los
// chips del segmento, y el panel del segmento. Las hojas van con portal, así
// que el segmento las pone donde quiera dentro de `children`.
import type { ReactNode } from 'react';
import { cx } from '../../../ui/cx';
import { copy } from '../copy';
import { SEGMENT_SCREEN_ID, type Segment } from '../model';
import { ExploreAppBar } from './ExploreAppBar';
import { ExploreHead, panelId } from './ExploreHead';

/** Lo que cada pantalla de segmento recibe de ExploreScreen. */
export interface SegmentScreenProps {
    segments: readonly Segment[];
    segment: Segment;
    onSegment: (next: Segment) => void;
}

export interface ExploreLayoutProps extends SegmentScreenProps {
    /** Filtros activos (contador del botón Filtros). */
    filterCount?: number;
    /** Abre EXP-06. Sin él (segmento vacío, nada que filtrar), no hay botón Filtros. */
    onFilters?: () => void;
    /** Fila de chips bajo el SegmentedControl (ExploreChips). */
    chips?: ReactNode;
    children: ReactNode;
}

export function ExploreLayout({ segments, segment, onSegment, filterCount = 0, onFilters, chips, children }: ExploreLayoutProps) {
    const withTabs = segments.length > 1;
    const hasHead = withTabs || Boolean(chips);
    return (
        <>
            <ExploreAppBar filterCount={filterCount} onFilters={onFilters} />
            <main className="tl-app-screen__body explore-main">
                <ExploreHead segments={segments} value={segment} onChange={onSegment}>
                    {chips}
                </ExploreHead>
                <div
                    id={panelId(segment)}
                    role={withTabs ? 'tabpanel' : undefined}
                    aria-label={withTabs ? copy.segmentos[segment] : undefined}
                    data-screen-id={SEGMENT_SCREEN_ID[segment]}
                    className={cx('tl-app-screen__content', 'explore-panel', hasHead && 'explore-body')}
                >
                    {children}
                </div>
            </main>
        </>
    );
}
