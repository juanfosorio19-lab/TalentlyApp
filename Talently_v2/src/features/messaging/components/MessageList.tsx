// Los mensajes de una conversación (MSG-02): separador de día, MessageBubble
// propias y ajenas, y las tarjetas de sistema (entrevista, certificado), que
// nunca son burbujas.
import { Fragment } from 'react';
import { Button } from '../../../ui/Button';
import { ChatDay, MessageBubble } from '../../../ui/MessageBubble';
import { InterviewCard, SystemCard, type SystemCardLine } from '../../../ui/SystemCard';
import { IconCalendar, IconDocument, IconEye, IconInfo, IconLock, type IconComponent } from '../../../ui/icons';
import type { DemoSystemCard } from '../../demo/types';
import type { ChatItem } from '../model';

interface MessageListProps {
    items: readonly ChatItem[];
    /** Nombre de la otra parte, para lectores de pantalla («Seguridad Andes Ltda.: …»). */
    peerName: string;
    /** «Agregar al calendario» de la entrevista; `id` es el del mensaje (UID del evento). */
    onAddToCalendar: (card: DemoSystemCard, id: string) => void;
    /** Quien recibió el certificado: «Ver». */
    onViewCertificate: () => void;
    /** Quien lo compartió: «Dejar de compartir» (la tarjeta pasa a «Ya no está disponible»). */
    onStopSharing: (shareId: string) => void;
}

export function MessageList({ items, peerName, onAddToCalendar, onViewCertificate, onStopSharing }: MessageListProps) {
    return items.map((item, i) => {
        const newDay = i === 0 || items[i - 1]?.dia !== item.dia;
        return (
            <Fragment key={item.id}>
                {newDay && <ChatDay>{item.dia}</ChatDay>}
                {item.kind === 'texto' ? (
                    <MessageBubble own={item.own} time={item.hora} status={item.status} sender={item.own ? undefined : peerName}>
                        {item.texto}
                    </MessageBubble>
                ) : (
                    <SystemMessage
                        card={item.tarjeta}
                        shareId={item.shareId}
                        onAddToCalendar={() => onAddToCalendar(item.tarjeta, item.id)}
                        onView={onViewCertificate}
                        onStop={onStopSharing}
                    />
                )}
            </Fragment>
        );
    });
}

/** Ícono de 16 de cada línea del certificado, según el dato. */
function lineIcon(text: string): IconComponent {
    if (text.startsWith('Emitido')) return IconCalendar;
    if (text.startsWith('Disponible')) return IconLock;
    if (text.startsWith('Visto')) return IconEye;
    return IconInfo; // «Subido por ti, sin verificar», «Documento subido por la persona, sin verificar»
}

/** Atributo de la tarjeta compartida en esta sesión: la pantalla le pasa el foco al dejar de compartirla. */
export const SHARE_ATTR = 'data-share-id';

interface SystemMessageProps {
    card: DemoSystemCard;
    /** Solo en el certificado que compartió quien mira en esta sesión. */
    shareId?: string;
    onAddToCalendar: () => void;
    onView: () => void;
    onStop: (shareId: string) => void;
}

function SystemMessage({ card, shareId, onAddToCalendar, onView, onStop }: SystemMessageProps) {
    if (card.tipo === 'entrevista') {
        if (!card.disponible) return <SystemCard icon={IconCalendar} title={card.titulo} off />;
        const [when = '', place = ''] = card.lineas;
        return <InterviewCard when={when} place={place} onAddToCalendar={card.accion ? onAddToCalendar : undefined} />;
    }
    const lines: SystemCardLine[] = card.lineas.map((text) => ({ icon: lineIcon(text), text }));
    // Quien lo compartió: «Dejar de compartir» (ghost); la otra parte: «Ver» (tonal), como CertificateCard.
    const action = card.accion ? (
        shareId ? (
            <Button variant="ghost" size="sm" onClick={() => onStop(shareId)}>
                {card.accion}
            </Button>
        ) : (
            <Button variant="tonal" size="sm" onClick={onView}>
                {card.accion}
            </Button>
        )
    ) : undefined;
    // La compartida en esta sesión recibe el foco (tabIndex -1) cuando «Dejar de compartir» desaparece.
    const focusable = shareId ? { [SHARE_ATTR]: shareId, tabIndex: -1, className: 'tl-focus' } : {};
    return <SystemCard icon={IconDocument} title={card.titulo} lines={lines} actions={action} off={!card.disponible} {...focusable} />;
}
