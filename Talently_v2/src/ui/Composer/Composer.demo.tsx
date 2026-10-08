import { useEffect, useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoSection } from '../catalog/demo';
import { Banner } from '../Banner';
import { Chat, MessageBubble, type MessageStatus } from '../MessageBubble';
import { Composer } from './Composer';

const noop = () => {};
const ASK = '¿A qué hora termina el turno?';

type Sent = { id: number; text: string; status: MessageStatus };

/** Composer de verdad: crece hasta 4 líneas, avisa con un teléfono o un enlace y envía solo con el botón. */
function LiveComposer() {
    const [draft, setDraft] = useState('');
    const [sent, setSent] = useState<Sent[]>([]);
    const pending = sent.find((m) => m.status === 'sending');

    useEffect(() => {
        if (!pending) return;
        const t = window.setTimeout(
            () => setSent((list) => list.map((m) => (m.id === pending.id ? { ...m, status: 'sent' } : m))),
            900,
        );
        return () => window.clearTimeout(t);
    }, [pending]);

    return (
        <DemoFrame width={390}>
            <Chat label="Conversación con Banquetería Rosa SpA">
                <MessageBubble time="12:46" sender="Banquetería Rosa SpA">
                    Sí, en Gran Avenida 5530. Pregunta por Rosa en la entrada.
                </MessageBubble>
                {sent.map((m) => (
                    <MessageBubble key={m.id} own time="13:00" status={m.status}>
                        {m.text}
                    </MessageBubble>
                ))}
            </Chat>
            <Composer
                value={draft}
                onChange={setDraft}
                onAttach={noop}
                onSend={(text) => {
                    setSent((list) => [...list, { id: list.length + 1, text, status: 'sending' }]);
                    setDraft('');
                }}
            />
        </DemoFrame>
    );
}

const demo: DemoModule = {
    name: 'Composer',
    group: 'Chat y match',
    summary:
        'Barra para escribir en el chat, fija abajo: adjuntar, campo pill que crece hasta 4 líneas y «Enviar» con relleno de marca. Con un teléfono o un enlace aparece encima el aviso «Por tu seguridad…».',
    Demo: () => (
        <>
            <DemoSection title="Al escribir un teléfono o un enlace (M5) · Banner warning sobre el Composer">
                <DemoFrame width={390}>
                    <Composer
                        className="is-focus"
                        value="Te dejo mi número: +56 9 1234 5678"
                        onChange={noop}
                        onSend={noop}
                        onAttach={noop}
                    />
                </DemoFrame>
                <DemoLabel>Avisa, no bloquea: el mensaje se puede enviar igual. Desaparece si se borra el número o el enlace.</DemoLabel>
            </DemoSection>
            <DemoSection title="Si la otra parte pide el certificado por texto (M5) · Banner info">
                <DemoFrame width={390}>
                    <Composer
                        value=""
                        onChange={noop}
                        onSend={noop}
                        onAttach={noop}
                        notice={<Banner>Compartirlo es voluntario.</Banner>}
                    />
                </DemoFrame>
                <DemoLabel>Lo ve solo quien trabaja o presta el servicio. La otra parte no tiene un botón para pedirlo.</DemoLabel>
            </DemoSection>
            <DemoSection title="Probar: escribe +56 9 1234 5678 o www.minegocio.cl">
                <LiveComposer />
                <DemoLabel>Enter hace un salto de línea: solo el botón envía.</DemoLabel>
            </DemoSection>
            <DemoSection title="Default">
                <Composer value="" onChange={noop} onSend={noop} onAttach={noop} />
                <DemoLabel>Vacío: «Enviar» deshabilitado.</DemoLabel>
                <Composer value={ASK} onChange={noop} onSend={noop} onAttach={noop} />
            </DemoSection>
            <DemoSection title="Presionado">
                <Composer value={ASK} onChange={noop} onSend={noop} onAttach={noop} sendProps={{ className: 'is-pressed' }} />
            </DemoSection>
            <DemoSection title="Foco">
                <Composer className="is-focus" value="¿A qué hora" onChange={noop} onSend={noop} onAttach={noop} />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <DemoNotApplicable>No se marca.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <Composer
                    value=""
                    onChange={noop}
                    onSend={noop}
                    closedReason="Esta conversación se cerró porque el turno terminó."
                />
                <DemoLabel>Si la conversación se cierra, el Composer se reemplaza por el motivo.</DemoLabel>
            </DemoSection>
            <DemoSection title="Error">
                <DemoNotApplicable>
                    El error se muestra en la burbuja («No se envió · Reintentar»); el texto no se borra.
                </DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Cargando">
                <Composer value={ASK} onChange={noop} onSend={noop} onAttach={noop} sending />
            </DemoSection>
        </>
    ),
};

export default demo;
