import { useState } from 'react';
import { Button } from '../Button';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoRow, DemoSection } from '../catalog/demo';
import { IconLocation } from '../icons';
import { Radio } from '../Radio';
import { Select } from '../Select';
import { TextField } from '../TextField';
import { CATEGORIAS_CLASE, COMUNAS_RM, OFICIOS_GASTRONOMIA } from './demoData';
import { SheetPicker } from './SheetPicker';

const noop = () => {};

const comuna = {
    title: 'Comuna',
    options: COMUNAS_RM,
    searchPlaceholder: 'Buscar comuna',
    groupLabel: 'Región Metropolitana · 52 comunas',
    emptyIcon: IconLocation,
    emptyText: 'Revisa cómo lo escribiste o busca solo el nombre de la comuna.',
};

/** El formulario de ONB-03 bajo el velo: el Select que abrió la hoja conserva el foco. */
function Behind() {
    return (
        <div className="tl-app-screen__content">
            <Select
                className="is-focus"
                label="Comuna"
                placeholder="Elige tu comuna"
                options={COMUNAS_RM}
                value="nunoa"
                onChange={noop}
                onClick={(e) => e.preventDefault()}
            />
            <TextField label="Dirección" optional placeholder="Ej.: Av. Irarrázaval 3450" />
        </div>
    );
}

/** Hoja abierta y quieta, como en preview.html (no toma el foco ni entra en la pila de capas). */
function StaticPicker({ query, height = 560 }: { query?: string; height?: number }) {
    return (
        <DemoFrame height={height}>
            <Behind />
            <SheetPicker {...comuna} open onClose={noop} value="nunoa" onChange={noop} defaultQuery={query} portal={false} modal={false} />
        </DemoFrame>
    );
}

/** SHT-OFICIO en elección múltiple: casillas, contador «2 de 3» y «Listo». */
function MultiplePicker() {
    const [oficios, setOficios] = useState<string[]>(['garzon', 'bartender']);
    return (
        <DemoFrame height={560}>
            <div className="tl-app-screen__content" />
            <SheetPicker
                multiple
                open
                onClose={noop}
                title="Gastronomía y eventos"
                options={OFICIOS_GASTRONOMIA}
                value={oficios}
                onChange={setOficios}
                max={3}
                searchPlaceholder="Buscar oficio"
                groupLabel="Elige hasta 3 oficios"
                portal={false}
                modal={false}
            />
        </DemoFrame>
    );
}

/** Filas con el ícono de la categoría antes del nombre (materia de una clase, EXP-06 de Clases). */
function IconPicker() {
    return (
        <DemoFrame height={560}>
            <div className="tl-app-screen__content" />
            <SheetPicker
                open
                onClose={noop}
                title="Categoría de la clase"
                options={CATEGORIAS_CLASE}
                value="clases-idiomas"
                onChange={noop}
                searchPlaceholder="Buscar categoría"
                portal={false}
                modal={false}
            />
        </DemoFrame>
    );
}

/** Hoja de verdad: abre desde el Select; Cerrar, velo, asa, Escape o elegir la cierran. */
function LivePicker() {
    const [value, setValue] = useState<string | null>('nunoa');
    const [open, setOpen] = useState(false);
    const [oficios, setOficios] = useState<string[]>([]);
    const [openOficios, setOpenOficios] = useState(false);
    const names = OFICIOS_GASTRONOMIA.filter((o) => oficios.includes(o.value)).map((o) => o.label);
    return (
        <DemoFrame height={560}>
            <div className="tl-app-screen__content">
                <TextField
                    label="Comuna elegida"
                    readOnly
                    value={COMUNAS_RM.find((c) => c.value === value)?.label ?? ''}
                    help="Prueba buscar «nunoa», «la» o «santiago centro»."
                />
                <Button variant="tonal" onClick={() => setOpen(true)}>
                    Cambiar comuna
                </Button>
                <Button variant="outline" onClick={() => setOpenOficios(true)}>
                    {names.length ? `Oficios: ${names.join(', ')}` : 'Elegir oficios'}
                </Button>
                <DemoLabel>«mesero» encuentra «Garzón o garzona» (sinónimo); el sinónimo nunca se muestra.</DemoLabel>
            </div>
            <SheetPicker {...comuna} open={open} onClose={() => setOpen(false)} value={value} onChange={setValue} portal={false} />
            <SheetPicker
                multiple
                open={openOficios}
                onClose={() => setOpenOficios(false)}
                title="Gastronomía y eventos"
                options={OFICIOS_GASTRONOMIA}
                value={oficios}
                onChange={setOficios}
                max={3}
                searchPlaceholder="Buscar oficio"
                portal={false}
            />
        </DemoFrame>
    );
}

const demo: DemoModule = {
    name: 'SheetPicker',
    group: 'Campos',
    summary:
        'Hoja para elegir de una lista larga (comuna, oficio, materia, unidad): buscador fijo que resalta la coincidencia y filas con Radio a la derecha. En elección única, elegir cierra la hoja.',
    Demo: () => (
        <>
            <DemoSection title="Lista completa · Ñuñoa elegida">
                <StaticPicker />
                <DemoLabel>Al abrir, la lista se desplaza hasta la opción elegida.</DemoLabel>
            </DemoSection>
            <DemoSection title="Buscando «la» · coincidencia resaltada">
                <StaticPicker query="la" />
            </DemoSection>
            <DemoSection title="Sin resultados">
                <StaticPicker query="Santiago centro" height={520} />
            </DemoSection>
            <DemoSection title="Elección múltiple · oficios con contador">
                <MultiplePicker />
                <DemoLabel>Al llegar a 3, el resto se deshabilita. «Listo» cierra la hoja.</DemoLabel>
            </DemoSection>
            <DemoSection title="Con ícono y descripción · categoría de la clase">
                <IconPicker />
            </DemoSection>
            <DemoSection title="Probar: abrir, buscar y elegir">
                <LivePicker />
            </DemoSection>
            <DemoSection title="Estados de una fila · Default">
                <DemoRow column>
                    <Radio variant="row" label="Macul" checked={false} onChange={noop} />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Presionado">
                <DemoRow column>
                    <Radio variant="row" className="is-pressed" label="Macul" checked={false} onChange={noop} />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Foco">
                <DemoRow column>
                    <Radio variant="row" className="is-focus" label="Macul" checked={false} onChange={noop} />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Seleccionado">
                <DemoRow column>
                    <Radio variant="row" label="Ñuñoa" checked onChange={noop} />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <DemoNotApplicable>
                    Las 52 comunas de la Región Metropolitana están disponibles. Una opción que no se puede elegir no se
                    muestra (salvo al llegar al máximo en elección múltiple).
                </DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Error">
                <DemoNotApplicable>El error («Elige una comuna») se muestra en el Select, no en la hoja.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Cargando">
                <DemoNotApplicable>
                    La lista que carga muestra Skeleton de lista, nunca un spinner suelto; el Select dice «Cargando comunas…».
                </DemoNotApplicable>
            </DemoSection>
        </>
    ),
};

export default demo;
