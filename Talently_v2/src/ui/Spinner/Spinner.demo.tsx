import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoRow, DemoSection } from '../catalog/demo';
import { Spinner } from './Spinner';

const demo: DemoModule = {
    name: 'Spinner',
    group: 'Acciones',
    summary: 'Indicador de espera dentro de un control (16, 24 o 40). Nunca suelto: una lista que carga usa Skeleton.',
    Demo: () => (
        <DemoSection title="Tamaños">
            <DemoRow>
                <DemoItem label="16 · campos, botón sm"><Spinner size={16} /></DemoItem>
                <DemoItem label="24 · botones, IconButton"><Spinner /></DemoItem>
                <DemoItem label="40 · foto de perfil"><Spinner size={40} /></DemoItem>
            </DemoRow>
        </DemoSection>
    ),
};

export default demo;
