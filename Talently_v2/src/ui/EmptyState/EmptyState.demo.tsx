import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoSection } from '../catalog/demo';
import { IconCalendar, IconChat, IconLocation } from '../icons';
import { EmptyState } from './EmptyState';

/** Estado que el componente no tiene, con su motivo (como en el sistema de diseño). */
function NotApplicable({ children }: { children: string }) {
    return (
        <span className="body">
            <span className="tl-badge">No aplica</span> {children}
        </span>
    );
}

const demo: DemoModule = {
    name: 'EmptyState',
    group: 'Avisos y estados',
    summary: 'Lista o pantalla sin nada que mostrar: ícono del set en un círculo de 72, título, por qué y una acción real (Button tonal) o una sugerencia útil.',
    Demo: () => (
        <>
            <DemoSection title="Explorar · Turnos, sin resultados en la comuna elegida">
                <DemoFrame>
                    <EmptyState
                        icon={IconLocation}
                        title="No hay turnos en Ñuñoa"
                        text="Hay 8 turnos a menos de 10 km, en Providencia, Macul y Santiago."
                        action={{ label: 'Ver turnos cercanos' }}
                    />
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Mensajes, sin conversaciones">
                <DemoFrame>
                    <EmptyState
                        icon={IconChat}
                        title="Aún no tienes conversaciones"
                        text="Cuando postules o tomes un turno, aquí podrás hablar con quien publica."
                        action={{ label: 'Explorar turnos' }}
                    />
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Actividad · Agenda, sin nada agendado">
                <DemoFrame>
                    <EmptyState
                        icon={IconCalendar}
                        title="Aún no tienes nada agendado"
                        text="Cuando te confirmen un turno o una entrevista, aparecerá aquí."
                        action={{ label: 'Ver turnos de esta semana' }}
                    />
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoSection title="Default"><DemoLabel>Mostrado arriba.</DemoLabel></DemoSection>
                <DemoSection title="Presionado"><NotApplicable>Lo tiene su botón.</NotApplicable></DemoSection>
                <DemoSection title="Foco"><NotApplicable>Lo tiene su botón.</NotApplicable></DemoSection>
                <DemoSection title="Seleccionado"><NotApplicable>No se marca.</NotApplicable></DemoSection>
                <DemoSection title="Deshabilitado">
                    <NotApplicable>Si no hay acción posible, el texto da la sugerencia.</NotApplicable>
                </DemoSection>
                <DemoSection title="Error"><NotApplicable>Para un error se usa ErrorState.</NotApplicable></DemoSection>
                <DemoSection title="Cargando">
                    <NotApplicable>Mientras carga se muestra Skeleton, nunca un EmptyState.</NotApplicable>
                </DemoSection>
            </DemoSection>
        </>
    ),
};

export default demo;
