import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { ReliabilityInline, ReliabilityMeter } from './ReliabilityMeter';

/** Un estado que no aplica (con su motivo) o que se explica en texto, como en preview.html. */
function StateNote({ state, na = true, children }: { state: string; na?: boolean; children: string }) {
    return (
        <DemoItem label={state}>
            <span className="body">{na && <Badge>No aplica</Badge>} {children}</span>
        </DemoItem>
    );
}

const demo: DemoModule = {
    name: 'ReliabilityMeter',
    group: 'Datos y confianza',
    summary: 'Confiabilidad = turnos asistidos ÷ confirmados, siempre con la cantidad al lado («Confiabilidad 96 % · 25 turnos cumplidos»). Se muestra desde 3 turnos.',
    Demo: () => (
        <>
            <DemoSection title="Completo · en el perfil de un trabajador de turnos">
                <div className="tl-card">
                    <ReliabilityMeter attended={25} confirmed={26} />
                </div>
            </DemoSection>
            <DemoSection title="Compacto · en tarjetas y Personas sugeridas">
                <ReliabilityInline attended={25} confirmed={26} />
            </DemoSection>
            <DemoSection title="Otros casos">
                <div className="tl-card">
                    <ReliabilityMeter attended={7} confirmed={9} />
                </div>
                <div className="tl-card">
                    <ReliabilityMeter attended={2} confirmed={2} />
                </div>
                <ReliabilityInline attended={2} confirmed={2} />
            </DemoSection>
            <DemoSection title="Estados">
                <DemoRow column>
                    <StateNote state="default" na={false}>Mostrado arriba.</StateNote>
                    <StateNote state="presionado">No se toca.</StateNote>
                    <StateNote state="foco">Se lee como medidor (role="meter").</StateNote>
                    <StateNote state="seleccionado">No se marca.</StateNote>
                    <StateNote state="deshabilitado">No aplica.</StateNote>
                    <StateNote state="error">No aplica.</StateNote>
                    <StateNote state="cargando" na={false}>Llega con el perfil; mientras, Skeleton.</StateNote>
                </DemoRow>
            </DemoSection>
        </>
    ),
};

export default demo;
