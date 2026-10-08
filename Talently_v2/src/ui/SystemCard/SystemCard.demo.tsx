import { useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoRow, DemoSection } from '../catalog/demo';
import { Chat, MessageBubble } from '../MessageBubble';
import { CertificateCard, InterviewCard, QuoteCard, type QuoteState } from './SystemCard';

const noop = () => {};

const INTERVIEW = { when: 'mar 15 dic · 10:00', place: 'Av. Concha y Toro 1234, Puente Alto' } as const;
const CERTIFICATE = { issuedOn: '30-11-2026', issuedDaysAgo: 8, availableUntil: 'jue 17 dic' } as const;
const QUOTE = {
    total: 85000,
    withMaterials: true,
    includes: 'Cambio de llave de paso y flexible',
    when: 'jue 17 jun · 10:00',
    validUntil: 'dom 20 jun',
} as const;

/** Cotización de verdad: «Aceptar» carga y pasa a «Aceptado»; «Rechazar» la deja vencida para pedir otra. */
function LiveQuote() {
    const [state, setState] = useState<QuoteState>('open');
    const [loading, setLoading] = useState<'accept' | 'reject' | 'request' | undefined>();
    const run = (action: 'accept' | 'reject' | 'request', next: QuoteState) => () => {
        setLoading(action);
        window.setTimeout(() => {
            setLoading(undefined);
            setState(next);
        }, 900);
    };
    return (
        <QuoteCard
            {...QUOTE}
            state={state}
            loading={loading}
            onReject={run('reject', 'expired')}
            onAccept={run('accept', 'accepted')}
            onRequestNew={run('request', 'open')}
        />
    );
}

const demo: DemoModule = {
    name: 'SystemCard',
    group: 'Chat y match',
    summary:
        'Tarjeta de sistema dentro del chat, de ancho completo y nunca una burbuja: entrevista agendada, certificado de antecedentes compartido y cotización. Resuelta, un Badge reemplaza a las acciones.',
    Demo: () => (
        <>
            <DemoSection title="En la conversación · ancho completo, nunca una burbuja">
                <DemoFrame width={390}>
                    <Chat label="Conversación con Taller Los Aromos">
                        <MessageBubble time="17:34" sender="Taller Los Aromos">
                            Hola, Jorge. Te agendamos una entrevista para el martes.
                        </MessageBubble>
                        <InterviewCard {...INTERVIEW} onAddToCalendar={noop} />
                        <MessageBubble own time="17:41" status="read">
                            Ahí estaré. ¿Tengo que llevar algo?
                        </MessageBubble>
                    </Chat>
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Entrevista · la misma tarjeta en el chat (MSG-02) y en el proceso (PRC-01)">
                <InterviewCard {...INTERVIEW} onAddToCalendar={noop} />
            </DemoSection>
            <DemoSection title="Certificado de antecedentes compartido (MSG-02b) · Marta y Familia en Ñuñoa">
                <DemoRow column>
                    <DemoLabel>Lo ve la otra parte · con «Ver»</DemoLabel>
                    <CertificateCard viewer="other" {...CERTIFICATE} onView={noop} />
                    <DemoLabel>Lo ve Marta · quién lo vio y «Dejar de compartir»</DemoLabel>
                    <CertificateCard viewer="owner" {...CERTIFICATE} seenBy="Familia en Ñuñoa · hace 2 h" onStopSharing={noop} />
                    <DemoLabel>Emitido hace más de 30 días · la fecha pasa a warning</DemoLabel>
                    <CertificateCard viewer="other" {...CERTIFICATE} issuedDaysAgo={45} onView={noop} />
                    <DemoLabel>
                        Vencido a los 7 días, revocado o cortado por bloqueo · color-surface-2 y color-text-disabled, sin bajar la opacidad
                    </DemoLabel>
                    <CertificateCard viewer="other" {...CERTIFICATE} off />
                </DemoRow>
                <DemoLabel>
                    Si Talently lo verificó, la línea «sin verificar» se reemplaza por el VerificationBadge verificado. Nunca es una burbuja de
                    archivo.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Cotización (M10) · SRV-02 · Luis Contreras a Rosa Muñoz · F3">
                <DemoRow column>
                    <DemoLabel>Abierta · «Rechazar» / «Aceptar» (Aceptar abre el pago)</DemoLabel>
                    <QuoteCard {...QUOTE} state="open" onReject={noop} onAccept={noop} />
                    <DemoLabel>Aceptada · el Badge del diccionario reemplaza a las acciones</DemoLabel>
                    <QuoteCard {...QUOTE} state="accepted" />
                    <DemoLabel>Vencida · la vigencia pasa a warning y queda «Pedir nueva cotización»</DemoLabel>
                    <QuoteCard {...QUOTE} state="expired" onRequestNew={noop} />
                </DemoRow>
                <DemoLabel>
                    La misma tarjeta se ve en el chat y en el detalle de la solicitud (SRV-02). El total va en Amount lg con «Total, con
                    materiales» (o «sin materiales»).
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Probar: aceptar, rechazar y pedir otra">
                <LiveQuote />
            </DemoSection>
            <DemoSection title="Default">
                <DemoLabel>Mostrado arriba.</DemoLabel>
            </DemoSection>
            <DemoSection title="Presionado">
                <DemoNotApplicable>Lo tienen sus botones.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Foco">
                <DemoNotApplicable>Lo tienen sus botones.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Seleccionado">
                <DemoLabel>Tras confirmar, un Badge del diccionario («Confirmado») reemplaza a las acciones.</DemoLabel>
                <InterviewCard {...INTERVIEW} status="Confirmado" />
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <DemoNotApplicable>Una acción que ya no aplica no se muestra.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Error">
                <DemoNotApplicable>Si la acción falla, Snackbar de error con «Reintentar».</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Cargando">
                <DemoLabel>Sus botones usan su estado cargando.</DemoLabel>
                <QuoteCard {...QUOTE} state="open" onReject={noop} onAccept={noop} loading="accept" />
            </DemoSection>
        </>
    ),
};

export default demo;
