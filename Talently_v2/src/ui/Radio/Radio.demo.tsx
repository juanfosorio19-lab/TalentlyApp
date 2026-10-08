import { useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { RadioGroup, type RadioOption } from './Radio';

type Desde = 'inmediata' | '15-dias' | '1-mes' | 'a-convenir';

const OPCIONES: RadioOption<Desde>[] = [
    { value: 'inmediata', label: 'Inmediata' },
    { value: '15-dias', label: 'En 15 días' },
    { value: '1-mes', label: 'En 1 mes' },
    { value: 'a-convenir', label: 'A convenir' },
];

/** Las mismas opciones, forzando un estado del catálogo en una de ellas. */
const forzar = (value: Desde, className: string) => OPCIONES.map((o) => (o.value === value ? { ...o, className } : o));

const nada = () => {};

function RadioDemo() {
    const [desde, setDesde] = useState<Desde | null>(null);
    return (
        <>
            <DemoSection title="Default · toca una opción">
                <RadioGroup legend="Disponible desde" options={OPCIONES} value={desde} onChange={setDesde} />
            </DemoSection>
            <DemoSection title="Presionado">
                <RadioGroup legend="Disponible desde" options={forzar('15-dias', 'is-pressed')} value={null} onChange={nada} />
                <DemoLabel>Presionando «En 15 días».</DemoLabel>
            </DemoSection>
            <DemoSection title="Foco">
                <RadioGroup legend="Disponible desde" options={forzar('inmediata', 'is-focus')} value="inmediata" onChange={nada} />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <RadioGroup legend="Disponible desde" options={OPCIONES} value="inmediata" onChange={nada} />
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <RadioGroup legend="Disponible desde" options={OPCIONES} value="1-mes" onChange={nada} disabled />
            </DemoSection>
            <DemoSection title="Error">
                <RadioGroup
                    legend="Disponible desde"
                    options={OPCIONES}
                    value={null}
                    onChange={nada}
                    error="Elige cuándo puedes empezar"
                />
            </DemoSection>
            <DemoSection title="Cargando">
                <span className="body">
                    <Badge>No aplica</Badge> Elegir es inmediato.
                </span>
            </DemoSection>
            <DemoSection title="Fila de lista · SheetPicker">
                <RadioGroup
                    legend="Comuna"
                    legendHidden
                    variant="row"
                    options={[
                        { value: 'cerrillos', label: 'Cerrillos' },
                        { value: 'cerro-navia', label: 'Cerro Navia' },
                        { value: 'conchali', label: 'Conchalí' },
                    ]}
                    value="cerrillos"
                    onChange={nada}
                />
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'Radio',
    group: 'Selección',
    summary: 'Opción de 20 px para elegir una sola de una lista corta, con toda la fila tocable. Las listas largas van en SheetPicker.',
    Demo: RadioDemo,
};

export default demo;
