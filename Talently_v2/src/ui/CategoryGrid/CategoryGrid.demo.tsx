import { useState, type ReactNode } from 'react';
import { JOB_CATEGORIES, type JobCategoryKey } from '../../domain/categorias';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoItem, DemoLabel, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { IconJobSecurity } from '../icons';
import { CategoryGrid, CategoryTile } from './CategoryGrid';

/**
 * La grilla vive en el cuerpo de una hoja (SHT-OFICIO, «Rubro»): marco de 390
 * con su margen de 16. Va bajo su rótulo `tl-sheet__group`, como en la hoja
 * real: `.tl-sheet__body` tiene `overflow: auto` y sin padding arriba, así que
 * como primer hijo el contorno de foco de la fila de arriba se recortaría.
 */
function Hoja({ grupo, children }: { grupo: string; children: ReactNode }) {
    return (
        <DemoFrame width={390}>
            <div className="tl-sheet__body">
                <p className="overline tl-sheet__group">{grupo}</p>
                {children}
            </div>
        </DemoFrame>
    );
}

const nombre = (key: JobCategoryKey) => JOB_CATEGORIES.find((c) => c.key === key)?.name ?? '';

function CategoryGridDemo() {
    const [abierta, setAbierta] = useState<JobCategoryKey | null>(null);
    const [rubro, setRubro] = useState<JobCategoryKey | null>('gastronomia-eventos');
    return (
        <>
            <DemoSection title="Las 16 categorías · dentro de SHT-OFICIO">
                <Hoja grupo="Categorías">
                    <CategoryGrid counts={{ seguridad: 2 }} onSelect={setAbierta} />
                </Hoja>
                <DemoLabel>
                    {abierta
                        ? `Abre los oficios de ${nombre(abierta)} en la misma hoja.`
                        : 'Tocar una categoría abre sus oficios en la misma hoja. La que ya tiene oficios elegidos se marca y dice cuántos.'}
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Selector de rubro · ONB-O1, hoja «Rubro»">
                <Hoja grupo="Categorías">
                    <CategoryGrid aria-label="Rubro" value={rubro} onSelect={setRubro} />
                </Hoja>
                <DemoLabel>Tocar una categoría la elige y cierra la hoja; la elegida queda marcada, sin contador.</DemoLabel>
            </DemoSection>
            <DemoSection title="Estados">
                <Hoja grupo="Categorías">
                    <ul className="tl-catgrid" aria-label="Estados">
                        <li>
                            <DemoItem label="default">
                                <CategoryTile icon={IconJobSecurity} name="Seguridad" />
                            </DemoItem>
                        </li>
                        <li>
                            <DemoItem label="presionado">
                                <CategoryTile icon={IconJobSecurity} name="Seguridad" className="is-pressed" />
                            </DemoItem>
                        </li>
                        <li>
                            <DemoItem label="seleccionado">
                                <CategoryTile icon={IconJobSecurity} name="Seguridad" count={2} />
                            </DemoItem>
                        </li>
                        <li>
                            <DemoItem label="foco">
                                <CategoryTile icon={IconJobSecurity} name="Seguridad" className="is-focus" />
                            </DemoItem>
                        </li>
                    </ul>
                </Hoja>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <span className="body">
                    <Badge>No aplica</Badge> Todas las categorías se pueden abrir; al llegar a 3 oficios, lo que se
                    bloquea son los oficios, no las categorías.
                </span>
            </DemoSection>
            <DemoSection title="Error">
                <span className="body">
                    <Badge>No aplica</Badge> El error («Elige al menos 1 oficio») va en el paso, no en la grilla.
                </span>
            </DemoSection>
            <DemoSection title="Cargando">
                <span className="body">
                    <Badge>No aplica</Badge> Mientras carga el catálogo, la grilla muestra Skeleton de 96 con su misma
                    forma.
                </span>
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'CategoryGrid',
    group: 'Selección',
    summary: 'Grilla de 3 columnas con las 16 categorías de oficio y su ícono: abre los oficios de cada una o, como selector de rubro, la elige.',
    Demo: CategoryGridDemo,
};

export default demo;
