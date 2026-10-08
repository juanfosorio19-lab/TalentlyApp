import type { ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { TextArea } from './TextArea';

/** Estado que no aplica a este control, con su motivo (como en preview.html). */
function NoAplica({ children }: { children: ReactNode }) {
    return (
        <DemoRow>
            <Badge>No aplica</Badge>
            <DemoLabel>{children}</DemoLabel>
        </DemoRow>
    );
}

const LABEL = 'Cuéntanos de tu experiencia';
const EXPERIENCIA =
    'Trabajé 3 años como garzón en matrimonios y eventos. Sé montar mesas, servir y atender a grupos grandes sin bajar ritmo.';
const EXPERIENCIA_LARGA =
    'Trabajé 3 años de garzón en matrimonios y eventos. Sé montar mesas, servir vino y atender grupos grandes sin perder ritmo. También apoyé en cocina y en la barra cuando faltaba gente. Tengo certificado de manipulación de alimentos y llego siempre 15 minutos antes. Me acomodan turnos de fin de semana.';

const demo: DemoModule = {
    name: 'TextArea',
    group: 'Campos',
    summary:
        'Campo de varias líneas con contador al pie («120/300»). Al llegar al máximo, el contador pasa a warning: un límite nunca es danger.',
    Demo: () => (
        <>
            <DemoSection title="Default">
                <DemoRow column>
                    <TextArea
                        label={LABEL}
                        placeholder="Ej.: trabajé 2 años en banquetería y sé atender mesas"
                        help="Mínimo 20 caracteres"
                        maxLength={300}
                    />
                    <TextArea label={LABEL} defaultValue={EXPERIENCIA} help="Mínimo 20 caracteres" maxLength={300} />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Presionado">
                <NoAplica>Tocar el campo lo enfoca.</NoAplica>
            </DemoSection>
            <DemoSection title="Foco">
                <TextArea
                    className="is-focus"
                    label={LABEL}
                    defaultValue={EXPERIENCIA}
                    help="Mínimo 20 caracteres"
                    maxLength={300}
                />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <NoAplica>Un campo de texto no se marca.</NoAplica>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <TextArea
                    label={LABEL}
                    defaultValue={EXPERIENCIA}
                    help="Para editarla, pausa la publicación."
                    maxLength={300}
                    disabled
                />
            </DemoSection>
            <DemoSection title="Error">
                <TextArea
                    label={LABEL}
                    defaultValue="Soy garzón."
                    help="Mínimo 20 caracteres"
                    error="Escribe al menos 20 caracteres"
                    maxLength={300}
                />
            </DemoSection>
            <DemoSection title="Cargando">
                <NoAplica>El texto se valida al guardar; no hay carga dentro del campo.</NoAplica>
            </DemoSection>
            <DemoSection title="Límite alcanzado · warning, nunca danger">
                <TextArea label={LABEL} defaultValue={EXPERIENCIA_LARGA} help="Mínimo 20 caracteres" maxLength={300} />
            </DemoSection>
            <DemoSection title="Opcional · postular con mensaje (DET-02)">
                <TextArea
                    label="Mensaje"
                    optional
                    placeholder="Ej.: tengo 8 años como guardia y vivo cerca"
                    help="Lo verá Seguridad Andes Ltda. junto a tu perfil."
                    maxLength={300}
                />
            </DemoSection>
        </>
    ),
};

export default demo;
