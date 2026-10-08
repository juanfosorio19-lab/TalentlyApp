import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { Skeleton, SkeletonCard, SkeletonList, SkeletonProfile } from './Skeleton';

/** Un estado que no aplica (con su motivo) o que se explica en texto, como en preview.html. */
function StateNote({ state, na = true, children }: { state: string; na?: boolean; children: string }) {
    return (
        <DemoItem label={state}>
            <span className="body">{na && <Badge>No aplica</Badge>} {children}</span>
        </DemoItem>
    );
}

const demo: DemoModule = {
    name: 'Skeleton',
    group: 'Avisos y estados',
    summary: 'El estado de carga de toda lista, tarjeta o perfil: bloques con la forma del contenido, aria-busy y «Cargando…» oculto. Nunca un spinner suelto.',
    Demo: () => (
        <>
            <DemoSection title="Formas">
                <DemoRow>
                    <DemoItem label="line · 12"><Skeleton shape="line" width={120} /></DemoItem>
                    <DemoItem label="title · 16"><Skeleton shape="title" width={160} /></DemoItem>
                    <DemoItem label="chip · 28 pill"><Skeleton shape="chip" width={88} /></DemoItem>
                    <DemoItem label="tag · 28 radio sm"><Skeleton shape="tag" width={96} /></DemoItem>
                    <DemoItem label="circle · persona"><Skeleton shape="circle" size={40} /></DemoItem>
                    <DemoItem label="square · organización"><Skeleton shape="square" size={40} /></DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Lista">
                <SkeletonList />
            </DemoSection>
            <DemoSection title="Tarjeta · forma de PublicationCard">
                <SkeletonCard label="Cargando turnos…" />
            </DemoSection>
            <DemoSection title="Perfil">
                <SkeletonProfile label="Cargando perfil…" />
            </DemoSection>
            <DemoSection title="Estados">
                <DemoRow column>
                    <StateNote state="default" na={false}>Mostrado arriba: brillo de 1,4 s; con «reducir movimiento», quieto.</StateNote>
                    <StateNote state="presionado">No se toca.</StateNote>
                    <StateNote state="foco">No recibe foco.</StateNote>
                    <StateNote state="seleccionado">No se marca.</StateNote>
                    <StateNote state="deshabilitado">No aplica.</StateNote>
                    <StateNote state="error">Si la carga falla, se reemplaza por ErrorState.</StateNote>
                    <StateNote state="cargando" na={false}>Es el propio estado de carga.</StateNote>
                </DemoRow>
            </DemoSection>
        </>
    ),
};

export default demo;
