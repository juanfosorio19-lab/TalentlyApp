import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Timeline } from './Timeline';

/** Un estado que no aplica (con su motivo) o que se explica en texto, como en preview.html. */
function StateNote({ state, na = true, children }: { state: string; na?: boolean; children: string }) {
    return (
        <DemoItem label={state}>
            <span className="body">{na && <Badge>No aplica</Badge>} {children}</span>
        </DemoItem>
    );
}

const demo: DemoModule = {
    name: 'Timeline',
    group: 'Datos y confianza',
    summary: 'Pasos de un proceso en vertical (hechos, actual y pendientes sin fecha). Con --levels, los niveles de verificación de VER-01 con su estado, qué permiten y su acción.',
    Demo: () => (
        <>
            <DemoSection title="Postulación a empleo · Jorge Muñoz · Guardia de seguridad 4x4 (F1)">
                <Timeline
                    steps={[
                        { status: 'done', label: 'Postulado', date: '7 dic · 21:14' },
                        { status: 'done', label: 'Visto', date: '8 dic · 09:40' },
                        { status: 'done', label: 'En proceso', date: '9 dic · 17:05' },
                        { status: 'current', label: 'Entrevista', date: 'mar 15 dic · 10:00' },
                        { status: 'pending', label: 'Oferta' },
                        { status: 'pending', label: 'Contratado' },
                    ]}
                />
            </DemoSection>
            <DemoSection title="Turno · Matías Rojas · Garzones para cóctel corporativo (TUR-01)">
                <Timeline
                    steps={[
                        { status: 'done', label: 'Postulado', date: '6 dic · 18:20' },
                        { status: 'current', label: 'Confirmado', date: '8 dic · 16:05' },
                        { status: 'pending', label: 'Asististe' },
                    ]}
                />
            </DemoSection>
            <DemoSection title="Niveles de verificación · VER-01 (M8)">
                <Timeline
                    variant="levels"
                    steps={[
                        {
                            status: 'done',
                            label: 'Cuenta básica',
                            date: 'Desde el 14 mar 2025',
                            description: 'Postular a empleos y conversar.',
                        },
                        {
                            status: 'done',
                            label: 'Teléfono verificado',
                            date: 'Verificado el 14 mar 2025',
                            description: 'Tomar turnos y publicar.',
                        },
                        {
                            status: 'current',
                            label: 'Identidad verificada',
                            date: 'Pendiente',
                            description: 'Verifica tu identidad para recibir a alguien en tu casa.',
                            action: <Button size="sm">Verificar identidad</Button>,
                        },
                    ]}
                />
            </DemoSection>
            <DemoSection title="Niveles · en revisión (--review) y rechazada (--error, con el motivo)">
                <Timeline
                    variant="levels"
                    steps={[
                        {
                            id: 'review',
                            status: 'review',
                            label: 'Identidad verificada',
                            date: 'En revisión · te avisamos en menos de 24 h',
                        },
                        {
                            id: 'error',
                            status: 'error',
                            label: 'Identidad verificada',
                            date: 'Rechazada · hoy · 11:40',
                            reason: 'la foto de tu cédula por detrás salió cortada.',
                            action: <Button size="sm">Intentar de nuevo</Button>,
                        },
                    ]}
                />
            </DemoSection>
            <DemoSection title="Estados">
                <DemoRow column>
                    <StateNote state="default" na={false}>
                        Pasos hechos en color-success-text con check; el actual en color-primary-text; los pendientes en color-text-3.
                    </StateNote>
                    <StateNote state="presionado">La línea de tiempo no se toca.</StateNote>
                    <StateNote state="foco">Se lee como lista ordenada; el paso actual lleva aria-current.</StateNote>
                    <StateNote state="seleccionado" na={false}>El paso actual (aria-current="step").</StateNote>
                    <StateNote state="deshabilitado">No aplica.</StateNote>
                    <DemoItem label="error · cierre negativo: el último paso, con su Badge del diccionario">
                        <Timeline
                            steps={[
                                { status: 'done', label: 'Postulado', date: '7 dic · 21:14' },
                                { status: 'done', label: 'Visto', date: '8 dic · 09:40' },
                                { status: 'done', label: 'En proceso', date: '9 dic · 17:05' },
                                { status: 'done', label: 'Entrevista', date: 'mar 15 dic · 10:00', badge: 'No seleccionado' },
                            ]}
                        />
                    </DemoItem>
                    <DemoItem label="error · turno (TUR-01) cancelado por la organización">
                        <Timeline
                            steps={[
                                { status: 'done', label: 'Postulado', date: '6 dic · 18:20' },
                                {
                                    status: 'done',
                                    label: 'Confirmado',
                                    date: '8 dic · 16:05',
                                    badge: 'Cancelado por la organización',
                                },
                            ]}
                        />
                    </DemoItem>
                    <StateNote state="cargando">Llega con el detalle; mientras, Skeleton.</StateNote>
                </DemoRow>
            </DemoSection>
        </>
    ),
};

export default demo;
