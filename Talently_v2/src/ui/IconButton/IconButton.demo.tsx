import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoRow, DemoSection } from '../catalog/demo';
import { IconBell, IconHeart, IconFilter, IconGear, IconMore } from '../icons';
import { BackButton, IconButton } from './IconButton';

const demo: DemoModule = {
    name: 'IconButton',
    group: 'Acciones',
    summary: 'Botón circular de solo ícono (40 visual, 48 táctil), siempre con etiqueta. BackButton es su versión con flecha a la izquierda.',
    Demo: () => (
        <>
            <DemoSection title="Variantes">
                <DemoRow>
                    <DemoItem label="ghost"><IconButton icon={IconBell} label="Notificaciones" /></DemoItem>
                    <DemoItem label="tonal"><IconButton icon={IconMore} label="Más opciones" variant="tonal" /></DemoItem>
                    <DemoItem label="BackButton"><BackButton /></DemoItem>
                    <DemoItem label="Ajustes (Perfil)"><IconButton icon={IconGear} label="Configuración" /></DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Contador">
                <DemoRow>
                    <DemoItem label="2 sin leer"><IconButton icon={IconBell} label="Notificaciones, 2 sin leer" count={2} /></DemoItem>
                    <DemoItem label="desde 10"><IconButton icon={IconBell} label="Notificaciones, 12 sin leer" count={12} /></DemoItem>
                    <DemoItem label="filtros activos"><IconButton icon={IconFilter} label="Filtros, 3 activos" count={3} /></DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoRow>
                    <DemoItem label="presionado"><IconButton icon={IconHeart} label="Guardar" className="is-pressed" /></DemoItem>
                    <DemoItem label="foco"><IconButton icon={IconHeart} label="Guardar" className="is-focus" /></DemoItem>
                    <DemoItem label="seleccionado"><IconButton icon={IconHeart} label="Guardar" selected /></DemoItem>
                    <DemoItem label="tonal seleccionado"><IconButton icon={IconHeart} label="Guardar" variant="tonal" selected /></DemoItem>
                    <DemoItem label="deshabilitado"><IconButton icon={IconHeart} label="Guardar" disabled /></DemoItem>
                    <DemoItem label="cargando"><IconButton icon={IconHeart} label="Guardar" loading /></DemoItem>
                </DemoRow>
            </DemoSection>
        </>
    ),
};

export default demo;
