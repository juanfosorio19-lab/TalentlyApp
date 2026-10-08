import { useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { Switch } from './Switch';

const LABEL = 'Avisarme de turnos nuevos';
const DESC = 'Te avisamos cuando haya turnos de tus oficios cerca.';

function SwitchDemo() {
    const [on, setOn] = useState(false);
    return (
        <>
            <DemoSection title="Default · toca la fila">
                <Switch label={LABEL} description={DESC} checked={on} onChange={(e) => setOn(e.target.checked)} />
            </DemoSection>
            <DemoSection title="Presionado">
                <Switch label={LABEL} description={DESC} className="is-pressed" />
            </DemoSection>
            <DemoSection title="Foco">
                <Switch label={LABEL} description={DESC} className="is-focus" />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <Switch label={LABEL} description={DESC} defaultChecked />
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <div>
                    <Switch label="Avisos por correo" description="Verifica tu correo para activarlos." disabled />
                    <Switch
                        label="Avisos en la app"
                        description="Siempre activos mientras tengas turnos confirmados."
                        defaultChecked
                        disabled
                    />
                </div>
            </DemoSection>
            <DemoSection title="Error">
                <span className="body">
                    <Badge>No aplica</Badge> Si no se pudo guardar, el switch vuelve a su posición y aparece un Snackbar
                    «No pudimos guardar. Revisa tu conexión e intenta de nuevo».
                </span>
            </DemoSection>
            <DemoSection title="Cargando">
                <Switch label={LABEL} description={DESC} defaultChecked loading />
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'Switch',
    group: 'Selección',
    summary: 'El único toggle: riel 48×28 y toda la fila tocable. Para encender o apagar algo que se guarda al instante.',
    Demo: SwitchDemo,
};

export default demo;
