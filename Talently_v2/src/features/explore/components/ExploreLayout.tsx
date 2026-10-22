// Armazón de la pestaña Explorar: AppBar large (Buscar, Filtros con contador y
// la campana), la cabecera fija con el SegmentedControl y los chips del
// segmento, y el panel del segmento. Se dibuja UNA vez para todos los
// segmentos (ExploreScreen): al cambiar de segmento solo cambian los chips y
// el panel, y el SegmentedControl (con su foco) sigue en su lugar.
import type { ReactNode, Ref } from 'react';
import type { UrlSheet } from '../../../app/sheets';
import { cx } from '../../../ui/cx';
import { SegmentedControl } from '../../../ui/SegmentedControl';
import { copy } from '../copy';
import type { Segment } from '../filters';
import { SEGMENT_SCREEN_ID } from '../model';
import { ExploreAppBar } from './ExploreAppBar';

/** id del panel del segmento (aria-controls del SegmentedControl). */
export const panelId = (s: Segment) => `exp-panel-${s}`;

/** Lo que cada panel de segmento recibe de ExploreScreen. */
export interface SegmentPanelProps {
    /** useSheet('filtros'): la hoja EXP-06 del segmento. */
    filtersSheet: UrlSheet;
    /** Lleva el foco al panel cuando desaparece lo que se tocó («Quitar filtros», «Ver lista»). */
    focusPanel: () => void;
}

export interface ExploreLayoutProps {
    segments: readonly Segment[];
    segment: Segment;
    onSegment: (next: Segment) => void;
    /** Filtros activos (contador del botón Filtros). */
    filterCount: number;
    /** Abre EXP-06. Sin él (segmento vacío, nada que filtrar), no hay botón Filtros. */
    onFilters?: () => void;
    /** Fila de chips bajo el SegmentedControl (ExploreChips). */
    chips?: ReactNode;
    /** El panel recibe el foco cuando lo que se tocó desaparece («Quitar filtros»). */
    panelRef?: Ref<HTMLDivElement>;
    children: ReactNode;
}

export function ExploreLayout({ segments, segment, onSegment, filterCount, onFilters, chips, panelRef, children }: ExploreLayoutProps) {
    const withTabs = segments.length > 1;
    const hasHead = withTabs || Boolean(chips);
    return (
        <>
            <ExploreAppBar filterCount={filterCount} onFilters={onFilters} />
            <main className="tl-app-screen__body explore-main">
                {hasHead && (
                    <div className="explore-head">
                        <div className="explore-head__inner">
                            {withTabs && (
                                <div className="explore-head__pad">
                                    <SegmentedControl
                                        aria-label={copy.segmentos.aria}
                                        options={segments.map((s) => ({ value: s, label: copy.segmentos[s], controls: panelId(s) }))}
                                        value={segment}
                                        onChange={onSegment}
                                    />
                                </div>
                            )}
                            {chips}
                        </div>
                    </div>
                )}
                <div
                    ref={panelRef}
                    id={panelId(segment)}
                    role={withTabs ? 'tabpanel' : undefined}
                    aria-label={withTabs ? copy.segmentos[segment] : undefined}
                    tabIndex={-1}
                    data-screen-id={SEGMENT_SCREEN_ID[segment]}
                    className={cx('tl-app-screen__content', 'explore-panel', hasHead && 'explore-body')}
                >
                    {children}
                </div>
            </main>
        </>
    );
}

/** Fila de chips con scroll horizontal (`role="group"`). */
export function ExploreChips({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="explore-chips" role="group" aria-label={label}>
            {children}
        </div>
    );
}
