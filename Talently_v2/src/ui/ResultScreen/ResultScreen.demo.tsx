import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoSection } from '../catalog/demo';
import { ResultScreen } from './ResultScreen';

/** Estado que el componente no tiene, con su motivo (como en el sistema de diseño). */
function NotApplicable({ children }: { children: string }) {
    return (
        <span className="body">
            <span className="tl-badge">No aplica</span> {children}
        </span>
    );
}

const demo: DemoModule = {
    name: 'ResultScreen',
    group: 'Avisos y estados',
    summary: 'Pantalla completa con el resultado de una acción importante (éxito, información o error): un solo mensaje y el CTA fijo abajo.',
    Demo: () => (
        <>
            <DemoSection title="Éxito">
                <DemoFrame height={600}>
                    <ResultScreen
                        variant="success"
                        focusTitle={false}
                        title="Postulaste a Guardia de seguridad 4x4"
                        text="Seguridad Andes Ltda. revisará tu perfil. Te avisamos cuando cambie el estado."
                        action={{ label: 'Ver mis postulaciones' }}
                        secondaryAction={{ label: 'Seguir explorando' }}
                    />
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Información">
                <DemoFrame height={600}>
                    <ResultScreen
                        variant="info"
                        focusTitle={false}
                        title="Quedaste en la lista de espera"
                        text="Las reservas de clases abren en marzo. Te avisaremos ese mismo día para que completes tu perfil de profesora."
                        action={{ label: 'Volver al inicio' }}
                    />
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Error">
                <DemoFrame height={600}>
                    <ResultScreen
                        variant="error"
                        focusTitle={false}
                        title="No pudimos enviar tu postulación"
                        text="Revisa tu conexión e intenta de nuevo. Lo que escribiste quedó guardado."
                        action={{ label: 'Reintentar' }}
                        secondaryAction={{ label: 'Volver' }}
                    />
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoSection title="Default"><DemoLabel>Mostrado arriba: un solo mensaje por pantalla.</DemoLabel></DemoSection>
                <DemoSection title="Presionado"><NotApplicable>Lo tienen sus botones.</NotApplicable></DemoSection>
                <DemoSection title="Foco"><NotApplicable>Al abrir, el foco va al título.</NotApplicable></DemoSection>
                <DemoSection title="Seleccionado"><NotApplicable>No se marca.</NotApplicable></DemoSection>
                <DemoSection title="Deshabilitado"><NotApplicable>Sus botones siempre funcionan.</NotApplicable></DemoSection>
                <DemoSection title="Error"><DemoLabel>Variante error, arriba.</DemoLabel></DemoSection>
                <DemoSection title="Cargando"><NotApplicable>Aparece cuando la acción ya terminó.</NotApplicable></DemoSection>
            </DemoSection>
        </>
    ),
};

export default demo;
