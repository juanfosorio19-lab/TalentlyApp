import { useEffect, useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoSection } from '../catalog/demo';
import { Avatar } from '../Avatar';
import { ContextChip, ContextChipBar } from '../ContextChip';
import { IconMore } from '../icons';
import { BackButton, IconButton } from '../IconButton';
import { Stack } from '../Layout';
import { Chat, ChatDay, MessageBubble, type MessageStatus } from './MessageBubble';

const ROSA = 'Banquetería Rosa SpA';

/** Conversación de Matías con Banquetería Rosa SpA (MSG-02, F1). «Reintentar» reenvía de verdad. */
function Conversation() {
    const [retry, setRetry] = useState<MessageStatus>('error');
    useEffect(() => {
        if (retry !== 'sending') return;
        const t = window.setTimeout(() => setRetry('sent'), 1200);
        return () => window.clearTimeout(t);
    }, [retry]);

    return (
        <DemoFrame width={390}>
            {/* AppBar de conversación (lo arma AppBar en las pantallas). */}
            <header className="tl-appbar tl-appbar--chat">
                <div className="tl-appbar__row">
                    <BackButton />
                    <a className="tl-appbar__who" href="#perfil" aria-label={`Ver perfil de ${ROSA}`}>
                        <Avatar name={ROSA} kind="org" verified />
                        <span className="tl-appbar__who-text">
                            <span className="tl-appbar__name">{ROSA}</span>
                            <span className="tl-appbar__meta">Organización verificada</span>
                        </span>
                    </a>
                    <div className="tl-appbar__actions">
                        <IconButton icon={IconMore} label="Más opciones" />
                    </div>
                </div>
            </header>
            <ContextChipBar>
                <ContextChip kind="turno" title="Garzón" detail="sáb 12 dic" />
            </ContextChipBar>
            <Chat label={`Conversación con ${ROSA}`}>
                <ChatDay>Hoy</ChatDay>
                <MessageBubble time="12:41" sender={ROSA}>
                    Hola Matías, te confirmamos para el sábado. Hay que llegar a las 17:30 con camisa blanca y pantalón negro.
                </MessageBubble>
                <MessageBubble own time="12:44" status="read">
                    Perfecto, ahí estaré. ¿Es en el salón de San Miguel?
                </MessageBubble>
                <MessageBubble time="12:46" sender={ROSA}>
                    Sí, en Gran Avenida 5530. Pregunta por Rosa en la entrada.
                </MessageBubble>
                <MessageBubble own time="12:58" status="sent">
                    Gracias, nos vemos el sábado.
                </MessageBubble>
                <MessageBubble own time="13:00" status={retry} onRetry={() => setRetry('sending')}>
                    ¿Hay estacionamiento cerca?
                </MessageBubble>
            </Chat>
        </DemoFrame>
    );
}

const demo: DemoModule = {
    name: 'MessageBubble',
    group: 'Chat y match',
    summary:
        'Burbuja de chat: propia en color-primary a la derecha, ajena en color-surface-2 a la izquierda; hora y estado real debajo (Enviando…, Enviado, Leído, No se envió, en cola). Incluye la conversación (Chat) y el separador de día.',
    Demo: () => (
        <>
            <DemoSection title="Conversación · Matías y Banquetería Rosa SpA (F1)">
                <Conversation />
                <DemoLabel>Probar: «Reintentar» pasa a «Enviando…» y luego a «Enviado».</DemoLabel>
            </DemoSection>
            <DemoSection title="Sin conexión · el mensaje queda en cola (M5)">
                <Stack gap={2}>
                    <MessageBubble own time="13:05" status="queued">
                        Gracias, nos vemos el martes.
                    </MessageBubble>
                </Stack>
                <DemoLabel>
                    Burbuja en color-primary-subtle hasta que sale; al volver la señal se envía sola y pasa a «Enviado».
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Default">
                <Stack gap={2}>
                    <MessageBubble own time="12:58" status="sent">
                        Gracias, nos vemos el sábado.
                    </MessageBubble>
                    <MessageBubble own time="12:44" status="read">
                        Perfecto, ahí estaré.
                    </MessageBubble>
                </Stack>
                <DemoLabel>«Leído» solo cuando la otra persona lo abrió; nunca un check de leído falso.</DemoLabel>
            </DemoSection>
            <DemoSection title="Presionado">
                <DemoNotApplicable>
                    Mantener presionado abre una hoja con «Copiar» y «Reportar»; la burbuja no cambia.
                </DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Foco">
                <DemoNotApplicable>
                    La conversación se recorre mensaje a mensaje con lector de pantalla; no hay foco visual en la burbuja.
                </DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Seleccionado">
                <DemoNotApplicable>Los mensajes no se seleccionan.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <DemoNotApplicable>Un mensaje no se deshabilita.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Error">
                <Stack gap={2}>
                    <MessageBubble own time="13:00" status="error" onRetry={() => {}}>
                        ¿Hay estacionamiento cerca?
                    </MessageBubble>
                </Stack>
            </DemoSection>
            <DemoSection title="Cargando">
                <Stack gap={2}>
                    <MessageBubble own time="13:00" status="sending">
                        ¿Hay estacionamiento cerca?
                    </MessageBubble>
                </Stack>
            </DemoSection>
        </>
    ),
};

export default demo;
