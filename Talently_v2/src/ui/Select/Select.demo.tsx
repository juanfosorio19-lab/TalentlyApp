import { useState, type MouseEvent } from 'react';
import { Button } from '../Button';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoRow, DemoSection } from '../catalog/demo';
import { IconLocation } from '../icons';
import { COMUNAS_RM } from '../SheetPicker/demoData';
import { TextField } from '../TextField';
import { Select } from './Select';

const noop = () => {};
// Las muestras de estado no abren la hoja (en el catálogo saldría fuera del panel); la de «Probar» sí.
const stay = (e: MouseEvent) => e.preventDefault();

const REGIONES = [{ value: 'rm', label: 'Región Metropolitana' }] as const;

const comunaSheet = {
    options: COMUNAS_RM,
    searchPlaceholder: 'Buscar comuna',
    groupLabel: 'Región Metropolitana · 52 comunas',
    emptyIcon: IconLocation,
    emptyText: 'Revisa cómo lo escribiste o busca solo el nombre de la comuna.',
};

/** ONB-03: el Select abre SHT-COMUNA dentro del marco; elegir cierra la hoja y deja el valor. */
function LiveSelect() {
    const [comuna, setComuna] = useState<string | null>(null);
    const [tried, setTried] = useState(false);
    return (
        <DemoFrame height={560}>
            <div className="tl-app-screen__content">
                <Select
                    label="Comuna"
                    placeholder="Elige tu comuna"
                    {...comunaSheet}
                    value={comuna}
                    onChange={setComuna}
                    error={tried && !comuna ? 'Elige una comuna' : undefined}
                    portal={false}
                />
                <TextField label="Dirección" optional placeholder="Ej.: Av. Irarrázaval 3450" />
                <Button size="lg" block onClick={() => setTried(true)}>
                    Continuar
                </Button>
            </div>
        </DemoFrame>
    );
}

const demo: DemoModule = {
    name: 'Select',
    group: 'Campos',
    summary:
        'Campo de elección: se ve como un TextField con chevron y abre un SheetPicker con buscador. Las listas largas (comuna, oficio, materia) siempre se eligen en una hoja.',
    Demo: () => (
        <>
            <DemoSection title="Default">
                <DemoRow column>
                    <Select label="Comuna" placeholder="Elige tu comuna" {...comunaSheet} value={null} onChange={noop} onClick={stay} />
                    <Select label="Comuna" placeholder="Elige tu comuna" {...comunaSheet} value="nunoa" onChange={noop} onClick={stay} />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Presionado">
                <Select
                    className="is-pressed"
                    label="Comuna"
                    placeholder="Elige tu comuna"
                    {...comunaSheet}
                    value="nunoa"
                    onChange={noop}
                    onClick={stay}
                />
            </DemoSection>
            <DemoSection title="Foco">
                <Select
                    className="is-focus"
                    label="Comuna"
                    placeholder="Elige tu comuna"
                    {...comunaSheet}
                    value="nunoa"
                    onChange={noop}
                    onClick={stay}
                />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <DemoNotApplicable>El valor elegido se ve escrito en el campo; la marca vive dentro del SheetPicker.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <Select
                    label="Región"
                    placeholder="Elige tu región"
                    options={REGIONES}
                    value="rm"
                    onChange={noop}
                    disabled
                    help="Por ahora, Talently funciona solo en la Región Metropolitana."
                />
            </DemoSection>
            <DemoSection title="Error">
                <Select
                    label="Comuna"
                    placeholder="Elige tu comuna"
                    {...comunaSheet}
                    value={null}
                    onChange={noop}
                    onClick={stay}
                    error="Elige una comuna"
                />
            </DemoSection>
            <DemoSection title="Cargando">
                <Select
                    label="Comuna"
                    placeholder="Elige tu comuna"
                    options={[]}
                    value={null}
                    onChange={noop}
                    loading
                    loadingLabel="Cargando comunas…"
                />
            </DemoSection>
            <DemoSection title="Probar: abrir, buscar y elegir (ONB-03)">
                <LiveSelect />
                <DemoLabel>«Continuar» sin comuna muestra el error. Elegir una comuna cierra la hoja y deja el valor.</DemoLabel>
            </DemoSection>
        </>
    ),
};

export default demo;
