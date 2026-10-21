// Cabecera de Explorar bajo el AppBar: el SegmentedControl con los segmentos
// que aplican al actor (spec §5.2) y, debajo, la fila de chips del segmento
// (comuna y oficios en EXP-02, publicación en EXP-05). Queda fija mientras la
// lista pasa por debajo (EXP-02-turnos-desplazado).
import type { ReactNode } from 'react';
import { SegmentedControl } from '../../../ui/SegmentedControl';
import { copy } from '../copy';
import type { Segment } from '../model';

/** id del panel del segmento (aria-controls del SegmentedControl). */
export const panelId = (s: Segment) => `exp-panel-${s}`;

export interface ExploreHeadProps {
    segments: readonly Segment[];
    value: Segment;
    onChange: (next: Segment) => void;
    /** Fila de chips del segmento (ExploreChips). */
    children?: ReactNode;
}

/** Con un solo segmento no hay SegmentedControl; sin chips ni segmentos, no hay cabecera. */
export function ExploreHead({ segments, value, onChange, children }: ExploreHeadProps) {
    const withTabs = segments.length > 1;
    if (!withTabs && !children) return null;
    return (
        <div className="explore-head">
            <div className="explore-head__inner">
                {withTabs && (
                    <div className="explore-head__pad">
                        <SegmentedControl
                            aria-label={copy.segmentos.aria}
                            options={segments.map((s) => ({ value: s, label: copy.segmentos[s], controls: panelId(s) }))}
                            value={value}
                            onChange={onChange}
                        />
                    </div>
                )}
                {children}
            </div>
        </div>
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
