// Pestaña Explorar (/explorar?tipo=empleo|turno|personas). Elige el segmento
// que aplica al actor (spec §5.2: Empleos · Turnos para quien trabaja o aún no
// tiene perfiles; Personas para una organización o un hogar con aviso activo)
// y muestra su pantalla: EXP-01, EXP-02 o EXP-05. El segmento va en la URL con
// replace: la memoria de la pestaña y atrás vuelven al mismo, con su scroll.
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDemoSession } from '../../demo/session';
import { explorarUrl } from '../explorePaths';
import { defaultSegment, segmentsOf, type Segment } from '../model';
import '../explore.css';
import { EmpleosScreen } from './EmpleosScreen';
import { PersonasScreen } from './PersonasScreen';
import { TurnosScreen } from './TurnosScreen';

/** La pestaña abre en EXP-01, EXP-02 o EXP-05 según el actor; cada segmento lleva su id (data-screen-id). */
export const screenId = 'EXP-01';

export function ExploreScreen() {
    const { actor } = useDemoSession();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const segments = useMemo(() => segmentsOf(actor), [actor]);
    const requested = params.get('tipo');
    // Un segmento que no aplica al actor (enlace viejo, cambio de actor) cae en el suyo.
    const segment = segments.find((s) => s === requested) ?? defaultSegment(actor, segments);
    const onSegment = (next: Segment) => navigate(explorarUrl({ tipo: next }), { replace: true });

    const common = { segments, segment, onSegment };
    // key: al cambiar de actor, el segmento parte de cero (sus filtros se recuerdan por actor).
    switch (segment) {
        case 'empleo':
            return <EmpleosScreen key={actor.id} {...common} />;
        case 'turno':
            return <TurnosScreen key={actor.id} {...common} />;
        case 'personas':
            return <PersonasScreen key={actor.id} {...common} />;
    }
}
