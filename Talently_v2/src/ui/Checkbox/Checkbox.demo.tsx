import { useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { LinkText } from '../Button';
import { Checkbox, CheckboxGroup } from './Checkbox';

const ACEPTO = 'Acepto los Términos y la Política de privacidad';

type Jornada = 'completa' | 'part-time' | 'part-time-estudiante' | 'temporada';

function CheckboxDemo() {
    const [acepto, setAcepto] = useState(false);
    const [jornadas, setJornadas] = useState<Jornada[]>(['completa', 'part-time']);
    return (
        <>
            <DemoSection title="Default · toca la fila">
                <Checkbox label={ACEPTO} checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
            </DemoSection>
            <DemoSection title="Presionado">
                <Checkbox label={ACEPTO} className="is-pressed" />
            </DemoSection>
            <DemoSection title="Foco">
                <Checkbox label={ACEPTO} className="is-focus" />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <Checkbox label={ACEPTO} defaultChecked />
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <div>
                    <Checkbox label="Part time estudiante" description="Solo con matrícula vigente cargada." disabled />
                    <Checkbox label="Jornada completa" defaultChecked disabled />
                </div>
            </DemoSection>
            <DemoSection title="Error">
                <Checkbox label={ACEPTO} error="Para continuar, acepta los Términos y la Política de privacidad" />
            </DemoSection>
            <DemoSection title="Cargando">
                <span className="body">
                    <Badge>No aplica</Badge> Marcar es inmediato; lo que se guarda después se informa con Snackbar.
                </span>
            </DemoSection>
            <DemoSection title="Con enlaces · AUTH-02">
                <Checkbox
                    label={
                        <>
                            Acepto los <LinkText href="#terminos">Términos</LinkText> y la{' '}
                            <LinkText href="#privacidad">Política de privacidad</LinkText>
                        </>
                    }
                />
                <DemoLabel>Los enlaces abren el texto legal sin marcar la casilla; tocar el resto de la fila la marca.</DemoLabel>
            </DemoSection>
            <DemoSection title="En grupo · elección múltiple">
                <CheckboxGroup
                    legend="Jornada"
                    options={[
                        { value: 'completa', label: 'Jornada completa' },
                        { value: 'part-time', label: 'Part time' },
                        { value: 'part-time-estudiante', label: 'Part time estudiante' },
                        { value: 'temporada', label: 'Temporada' },
                    ]}
                    value={jornadas}
                    onChange={setJornadas}
                />
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'Checkbox',
    group: 'Selección',
    summary: 'Casilla de 20 px para elegir varias opciones o aceptar algo, con toda la fila tocable (mínimo 48).',
    Demo: CheckboxDemo,
};

export default demo;
