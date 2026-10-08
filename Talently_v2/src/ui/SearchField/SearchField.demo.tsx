import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { SearchField } from './SearchField';

/** Estado que no aplica a este control, con su motivo (como en preview.html). */
function NoAplica({ children }: { children: ReactNode }) {
    return (
        <DemoRow>
            <Badge>No aplica</Badge>
            <DemoLabel>{children}</DemoLabel>
        </DemoRow>
    );
}

const PLACEHOLDER = 'Buscar oficio, empresa o comuna';

/** Controlado: «Borrar búsqueda» llega como un onChange con valor vacío. */
function BuscarComuna() {
    const [q, setQ] = useState('Ñuñoa');
    return (
        <>
            <SearchField placeholder="Buscar comuna" value={q} onChange={(e) => setQ(e.target.value)} />
            <DemoLabel>{q ? `Buscando «${q}»` : 'Sin texto: se muestran todas las comunas de la RM'}</DemoLabel>
        </>
    );
}

const demo: DemoModule = {
    name: 'SearchField',
    group: 'Campos',
    summary:
        'Buscador sin borde (pill de 44): lupa, ejemplos en el placeholder y «Borrar búsqueda» cuando hay texto. Sin resultados no es un error.',
    Demo: () => (
        <>
            <DemoSection title="Default">
                <DemoRow column>
                    <SearchField placeholder={PLACEHOLDER} />
                    <SearchField placeholder={PLACEHOLDER} defaultValue="garzón" />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Presionado">
                <NoAplica>Tocar el campo lo enfoca. El botón borrar tiene su propio presionado (IconButton).</NoAplica>
            </DemoSection>
            <DemoSection title="Foco">
                <SearchField className="is-focus" placeholder={PLACEHOLDER} defaultValue="garz" />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <NoAplica>La búsqueda no se marca.</NoAplica>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <SearchField placeholder="Buscar no está disponible sin conexión" disabled />
            </DemoSection>
            <DemoSection title="Error">
                <NoAplica>Sin resultados no es un error: se muestra un EmptyState con una sugerencia útil.</NoAplica>
            </DemoSection>
            <DemoSection title="Cargando">
                <SearchField placeholder={PLACEHOLDER} defaultValue="garzón" loading />
            </DemoSection>
            <DemoSection title="Controlado · SHT-COMUNA">
                <BuscarComuna />
            </DemoSection>
        </>
    ),
};

export default demo;
