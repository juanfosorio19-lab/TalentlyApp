import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoSection } from '../catalog/demo';
import { AvailabilityGrid, type AvailabilityCell, type AvailabilityWeekday } from './AvailabilityGrid';

/** Contenido de una pantalla de 390 (margen lateral space-4), como en el paso ONB-T2. */
function Phone({ children }: { children: ReactNode }) {
    return (
        <DemoFrame width={390}>
            <div className="tl-app-screen__content">{children}</div>
        </DemoFrame>
    );
}

// Matías Rojas (F1): vie noche, sáb tarde y noche, dom tarde y noche.
const MATIAS: AvailabilityCell[] = [
    { weekday: 5, band: 'noche' },
    { weekday: 6, band: 'tarde' },
    { weekday: 6, band: 'noche' },
    { weekday: 7, band: 'tarde' },
    { weekday: 7, band: 'noche' },
];

// Para no repetir la grilla completa, los estados muestran solo vie y sáb.
const VIE_SAB: AvailabilityWeekday[] = [5, 6];
const VIE_SAB_ELEGIDAS = MATIAS.filter((c) => c.weekday !== 7);
const nada = () => {};

function AvailabilityGridDemo() {
    const [value, setValue] = useState<AvailabilityCell[]>(MATIAS);
    return (
        <>
            <DemoSection title="7 días × 4 franjas · celdas de 48 · Matías Rojas (F1)">
                <Phone>
                    <AvailabilityGrid label="¿Cuándo puedes trabajar?" value={value} onChange={setValue} />
                </Phone>
                <DemoLabel>Toca las celdas: se marcan con check y el contador cambia.</DemoLabel>
            </DemoSection>
            <DemoSection title="Default">
                <Phone>
                    <AvailabilityGrid days={VIE_SAB} value={[]} onChange={nada} />
                </Phone>
            </DemoSection>
            <DemoSection title="Presionado">
                <Phone>
                    <AvailabilityGrid days={VIE_SAB} value={[]} onChange={nada} cellClassName={{ '5-manana': 'is-pressed' }} />
                </Phone>
            </DemoSection>
            <DemoSection title="Foco">
                <Phone>
                    <AvailabilityGrid
                        days={VIE_SAB}
                        value={VIE_SAB_ELEGIDAS}
                        onChange={nada}
                        cellClassName={{ '6-manana': 'is-focus' }}
                    />
                </Phone>
            </DemoSection>
            <DemoSection title="Seleccionado">
                <Phone>
                    <AvailabilityGrid days={VIE_SAB} value={VIE_SAB_ELEGIDAS} onChange={nada} />
                </Phone>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <Phone>
                    <AvailabilityGrid days={VIE_SAB} value={VIE_SAB_ELEGIDAS} onChange={nada} disabled />
                </Phone>
                <DemoLabel>Mientras se guarda el paso.</DemoLabel>
            </DemoSection>
            <DemoSection title="Error">
                <Phone>
                    <AvailabilityGrid days={VIE_SAB} value={[]} onChange={nada} error="Elige al menos una franja" />
                </Phone>
            </DemoSection>
            <DemoSection title="Cargando">
                <DemoNotApplicable>La grilla aparece con el paso; guardar usa el estado cargando de «Continuar».</DemoNotApplicable>
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'AvailabilityGrid',
    group: 'Agenda y archivos',
    summary: 'Disponibilidad por franjas: 7 días en filas × Mañana, Tarde, Noche y Madrugada en columnas, con celdas de 48 que se marcan con check y contador arriba.',
    Demo: AvailabilityGridDemo,
};

export default demo;
