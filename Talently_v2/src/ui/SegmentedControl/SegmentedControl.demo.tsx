import { useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { SegmentedControl, type SegmentedOption } from './SegmentedControl';

type Vista = 'empleo' | 'turno' | 'clase';

const F1: SegmentedOption<Vista>[] = [
    { value: 'empleo', label: 'Empleos' },
    { value: 'turno', label: 'Turnos' },
];
const F2: SegmentedOption<Vista>[] = [...F1, { value: 'clase', label: 'Clases' }];

/** F1 con un estado del catálogo forzado en «Turnos». */
const turnos = (className: string) => F1.map((o) => (o.value === 'turno' ? { ...o, className } : o));

const nada = () => {};

function SegmentedControlDemo() {
    const [f1, setF1] = useState<Vista>('empleo');
    const [f2, setF2] = useState<Vista>('clase');
    return (
        <>
            <DemoSection title="F1 · desde diciembre 2026 · toca un segmento">
                <SegmentedControl aria-label="Tipo de publicación" options={F1} value={f1} onChange={setF1} />
            </DemoSection>
            <DemoSection title="F2 · desde marzo 2027">
                <SegmentedControl aria-label="Tipo de publicación" options={F2} value={f2} onChange={setF2} />
                <DemoLabel>En F1 «Clases» no aparece: lo que no está lanzado no es segmento ni pestaña.</DemoLabel>
            </DemoSection>
            <DemoSection title="Default">
                <SegmentedControl aria-label="Tipo de publicación" options={F1} value="empleo" onChange={nada} />
                <DemoLabel>Inactivo: texto color-text-2 sobre color-surface-2.</DemoLabel>
            </DemoSection>
            <DemoSection title="Presionado">
                <SegmentedControl aria-label="Tipo de publicación" options={turnos('is-pressed')} value="empleo" onChange={nada} />
            </DemoSection>
            <DemoSection title="Foco">
                <SegmentedControl aria-label="Tipo de publicación" options={turnos('is-focus')} value="empleo" onChange={nada} />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <SegmentedControl aria-label="Tipo de publicación" options={F1} value="turno" onChange={nada} />
                <DemoLabel>Activo: color-surface-3 con elev-1 y texto color-text.</DemoLabel>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <SegmentedControl aria-label="Tipo de publicación" options={F1} value="empleo" onChange={nada} disabled />
                <DemoLabel>Solo mientras se cambia de actor; nunca para ocultar algo no lanzado.</DemoLabel>
            </DemoSection>
            <DemoSection title="Error">
                <span className="body">
                    <Badge>No aplica</Badge> Cambiar de segmento no falla; la lista muestra su propio estado.
                </span>
            </DemoSection>
            <DemoSection title="Cargando">
                <span className="body">
                    <Badge>No aplica</Badge> El segmento cambia al instante; la lista carga con Skeleton.
                </span>
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'SegmentedControl',
    group: 'Selección',
    summary: 'Selector de vista dentro de una pantalla (Explorar): alto 40, pill, una variante por fase.',
    Demo: SegmentedControlDemo,
};

export default demo;
