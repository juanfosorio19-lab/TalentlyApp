import { useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { ChipGroup, type ChipGroupOption } from './ChipGroup';

type Oficio = 'garzon' | 'bartender' | 'banquetero' | 'anfitrion' | 'cocinero' | 'ayudante-cocina';

const OFICIOS: ChipGroupOption<Oficio>[] = [
    { value: 'garzon', label: 'Garzón' },
    { value: 'bartender', label: 'Bartender' },
    { value: 'banquetero', label: 'Banquetero/a' },
    { value: 'anfitrion', label: 'Anfitrión o anfitriona' },
    { value: 'cocinero', label: 'Cocinero/a' },
    { value: 'ayudante-cocina', label: 'Ayudante de cocina' },
];

const COMUNAS: ChipGroupOption[] = [
    { value: 'maipu', label: 'Maipú' },
    { value: 'estacion-central', label: 'Estación Central' },
    { value: 'cerrillos', label: 'Cerrillos' },
    { value: 'pudahuel', label: 'Pudahuel' },
    { value: 'santiago', label: 'Santiago' },
];

const MAX_NOTE = 'Máximo 3 oficios. Quita uno para elegir otro.';
const nada = () => {};

function ChipGroupDemo() {
    const [oficios, setOficios] = useState<Oficio[]>(['garzon', 'bartender']);
    const [comunas, setComunas] = useState<string[]>(['maipu', 'estacion-central']);
    return (
        <>
            <DemoSection title="Default · toca los chips">
                <ChipGroup label="Oficios" options={OFICIOS} value={oficios} onChange={setOficios} max={3} maxNote={MAX_NOTE} />
            </DemoSection>
            <DemoSection title="Presionado">
                <span className="body">
                    <Badge>No aplica</Badge> Lo tiene cada chip.
                </span>
            </DemoSection>
            <DemoSection title="Foco">
                <span className="body">
                    <Badge>No aplica</Badge> Lo tiene cada chip; el grupo se recorre en orden.
                </span>
            </DemoSection>
            <DemoSection title="Seleccionado · máximo alcanzado">
                <ChipGroup
                    label="Oficios"
                    options={OFICIOS}
                    value={['garzon', 'bartender', 'banquetero']}
                    onChange={nada}
                    max={3}
                    maxNote={MAX_NOTE}
                />
                <DemoLabel>Límite alcanzado: contador y aviso en warning; los demás chips quedan deshabilitados hasta quitar uno.</DemoLabel>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <ChipGroup
                    label="Oficios"
                    options={OFICIOS}
                    value={['garzon']}
                    onChange={nada}
                    max={3}
                    maxNote={MAX_NOTE}
                    disabled
                />
                <DemoLabel>Todo el grupo, por ejemplo mientras se guarda el paso.</DemoLabel>
            </DemoSection>
            <DemoSection title="Error">
                <ChipGroup
                    label="Oficios"
                    options={OFICIOS}
                    value={[]}
                    onChange={nada}
                    max={3}
                    maxNote={MAX_NOTE}
                    error="Elige al menos 1 oficio"
                />
            </DemoSection>
            <DemoSection title="Cargando">
                <span className="body">
                    <Badge>No aplica</Badge> Las opciones que cargan muestran Skeleton.
                </span>
            </DemoSection>
            <DemoSection title="Con chips input y sugerencias · toca la X o el +">
                <ChipGroup
                    label="Comunas donde puedes trabajar"
                    mode="input"
                    options={COMUNAS}
                    value={comunas}
                    onChange={setComunas}
                    max={5}
                    maxNote="Máximo 5 comunas. Quita una para elegir otra."
                />
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'ChipGroup',
    group: 'Selección',
    summary: 'Chips con etiqueta, contador «2 de 3» y máximo en warning; error del grupo al intentar continuar sin elegir.',
    Demo: ChipGroupDemo,
};

export default demo;
