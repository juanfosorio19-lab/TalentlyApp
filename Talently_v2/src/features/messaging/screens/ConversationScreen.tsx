// MSG-02 · Conversación (/mensajes/:conversationId, prototipo MSG-02 y
// MSG-02-pedro) y MSG-02b · compartir certificado de antecedentes (flujo 10:
// MSG-02b-pedido, -adjuntar, -compartir, -marta y -marta-no-disponible; la vista
// de la familia es MSG-02b-familia). AppBar de conversación, ContextChip fijo
// bajo el AppBar, mensajes con estados reales (Enviando…, Enviado, Leído, en
// cola sin conexión), tarjetas de sistema y el Composer con su aviso de
// seguridad. Enviar agrega el mensaje localmente (store.ts) mientras Supabase
// está pausado.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { AppBar } from '../../../ui/AppBar';
import { Banner } from '../../../ui/Banner';
import { Composer } from '../../../ui/Composer';
import { ContextChip, ContextChipBar, PUBLICATION_TYPES } from '../../../ui/ContextChip';
import { Dialog } from '../../../ui/Dialog';
import { EmptyState } from '../../../ui/EmptyState';
import { IconChat } from '../../../ui/icons';
import { Chat } from '../../../ui/MessageBubble';
import { useSnackbar, type SnackbarTone } from '../../../ui/Snackbar';
import { useGoBack } from '../../../app/BackButtonManager';
import { paths } from '../../../app/paths';
import { getConversation, getPublication } from '../../demo/data';
import type { DemoConversation, DemoSystemCard, DemoViewerId } from '../../demo/types';
import { AttachSheet } from '../components/AttachSheet';
import { CertificateSheet } from '../components/CertificateSheet';
import { ConversationMenuSheet } from '../components/ConversationMenuSheet';
import { MessageList } from '../components/MessageList';
import { ReportSheet } from '../components/ReportSheet';
import { copy } from '../copy';
import { useLinks, useViewerId } from '../links';
import { DEMO_NOW_TIME, INTERVIEW_MINUTES } from '../mock';
import {
    certificateActive,
    certificateIssued,
    certificatePending,
    chatItems,
    contextOf,
    contextPath,
    interviewIcs,
    peerKind,
    peerProfilePath,
    peerVerified,
    viewerWorks,
} from '../model';
import {
    markRead,
    sendMessage,
    setBlocked,
    setDraft,
    shareCertificate,
    stopSharing,
    useConversationState,
    useOnline,
} from '../store';
import '../messaging.css';

export const screenId = 'MSG-02';

export function ConversationScreen() {
    const { conversationId } = useParams();
    const viewerId = useViewerId();
    const conv = conversationId ? getConversation(conversationId) : undefined;
    // Solo quien participa la ve (RLS de conversations en el spec §7.6).
    if (!conv || conv.viewerId !== viewerId) return <ConversationNotFound />;
    return <Conversation key={conv.id} conv={conv} viewerId={viewerId} />;
}

type Sheet = 'menu' | 'reportar' | 'adjuntar' | 'certificado';

function Conversation({ conv, viewerId }: { conv: DemoConversation; viewerId: DemoViewerId }) {
    const goBack = useGoBack();
    const snackbar = useSnackbar();
    const { go } = useLinks();
    const online = useOnline();
    const state = useConversationState(conv.id);
    const [sheet, setSheetState] = useState<Sheet | null>(null);
    const [blockOpen, setBlockOpen] = useState(false);
    const logRef = useRef<HTMLElement>(null);

    // Abrirla la deja leída: sus no leídos salen de la bandeja.
    useEffect(() => markRead(conv.id), [conv.id]);

    const items = useMemo(() => chatItems(conv, state), [conv, state]);
    useStickToBottom(logRef, items.length);

    const name = conv.con.nombre;
    const kind = peerKind(conv.con);
    const context = contextOf(conv.contexto.tipo, conv.contexto.chip);
    const contextTarget = contextPath(conv, viewerId);
    const publicationId = conv.contexto.publicationId;
    const publication = publicationId ? getPublication(publicationId) : undefined;
    const canShare = viewerWorks(conv) && Boolean(conv.certificado);

    // Al abrir una hoja se va el aviso anterior: no queda flotando sobre ella.
    const setSheet = (next: Sheet | null) => {
        if (next) snackbar.hide();
        setSheetState(next);
    };
    // En el chat el aviso va sobre el Composer, a la altura de la TabBar (M5 punto 13).
    const toast = (message: string, tone?: SnackbarTone) => snackbar.show({ message, tone, placement: 'tabbar' });
    const soon = () => toast(copy.soon);
    const closeAnd = (then: () => void) => () => {
        setSheet(null);
        then();
    };

    const addToCalendar = (card: DemoSystemCard) => {
        // En el teléfono hace falta el plugin de calendario: aún no está.
        const ics = Capacitor.isNativePlatform() ? null : interviewIcs(card, copy.chat.interviewWith(name), INTERVIEW_MINUTES);
        if (!ics) {
            soon();
            return;
        }
        const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'entrevista.ics';
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast(copy.chat.calendarDownloaded, 'success');
    };

    const openCertificate = () => {
        if (certificateActive(state)) {
            setSheet(null);
            toast(copy.chat.alreadySharing);
            return;
        }
        setSheet('certificado');
    };

    return (
        <div className="tl-app-screen msg-chat" data-screen-id={screenId}>
            <AppBar
                variant="chat"
                peer={{
                    name,
                    meta: conv.con.linea,
                    kind,
                    verified: peerVerified(conv.con),
                    onClick: () => go(peerProfilePath(conv.con), { placement: 'tabbar' }),
                }}
                onBack={goBack}
                onMore={() => setSheet('menu')}
            />
            {!online && <Banner fixed>{copy.chat.offline}</Banner>}
            <ContextChipBar>
                <ContextChip
                    {...context}
                    onClick={() => (contextTarget ? go(contextTarget) : toast(copy.chat.publicationGone))}
                />
            </ContextChipBar>
            <main ref={logRef} className="tl-app-screen__body msg-chat__log">
                {items.length === 0 ? (
                    <EmptyState icon={IconChat} title={copy.chat.emptyTitle} text={copy.chat.emptyText(name)} />
                ) : (
                    <Chat label={copy.chat.label(name)}>
                        <MessageList
                            items={items}
                            peerName={name}
                            onAddToCalendar={addToCalendar}
                            onViewCertificate={soon}
                            onStopSharing={(shareId) => {
                                stopSharing(conv.id, shareId);
                                toast(copy.chat.stoppedSharing, 'success');
                            }}
                        />
                    </Chat>
                )}
            </main>
            <Composer
                value={state.draft}
                onChange={(text) => setDraft(conv.id, text)}
                onSend={(text) => sendMessage(conv.id, text, DEMO_NOW_TIME)}
                onAttach={() => setSheet('adjuntar')}
                closedReason={state.blocked ? copy.chat.blocked(name) : undefined}
                notice={conv.certificado && certificatePending(conv, state) ? <Banner>{conv.certificado.aviso}</Banner> : undefined}
            />

            <ConversationMenuSheet
                open={sheet === 'menu'}
                onClose={() => setSheet(null)}
                title={name}
                publication={
                    publication && {
                        title: publication.titulo,
                        icon: PUBLICATION_TYPES[publication.tipo].icon,
                        onOpen: closeAnd(() => go(paths.publicacion(publication.id))),
                    }
                }
                blocked={state.blocked}
                onReport={() => setSheet('reportar')}
                onBlock={closeAnd(() => setBlockOpen(true))}
                onUnblock={closeAnd(() => {
                    setBlocked(conv.id, false);
                    toast(copy.block.unblocked(name), 'success');
                })}
            />
            <ReportSheet
                open={sheet === 'reportar'}
                onClose={() => setSheet(null)}
                onSend={() => {
                    setSheet(null);
                    toast(copy.report.sent, 'success');
                }}
            />
            <Dialog
                open={blockOpen}
                onClose={() => setBlockOpen(false)}
                title={copy.block.title(name)}
                confirmLabel={copy.block.confirm}
                destructive
                onConfirm={() => {
                    setBlocked(conv.id, true);
                    setBlockOpen(false);
                }}
            >
                {copy.block.text}
            </Dialog>
            <AttachSheet
                open={sheet === 'adjuntar'}
                onClose={() => setSheet(null)}
                certificate={canShare}
                onCertificate={openCertificate}
                onSoon={closeAnd(soon)}
            />
            {canShare && (
                <CertificateSheet
                    open={sheet === 'certificado'}
                    onClose={() => setSheet(null)}
                    peer={{ name, kind, initials: conv.con.iniciales }}
                    issued={certificateIssued(conv)}
                    onShare={closeAnd(() => shareCertificate(conv.id))}
                    onUpload={() => snackbar.show({ message: copy.soon })}
                />
            )}
        </div>
    );
}

/**
 * La conversación queda pegada abajo, como un chat: al abrirla, al llegar o
 * enviar un mensaje y cuando cambia el alto (aparece el aviso del Composer o
 * se abre el teclado), si la persona ya estaba abajo.
 */
function useStickToBottom(ref: RefObject<HTMLElement | null>, count: number) {
    const atBottom = useRef(true);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onScroll = () => {
            atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
        };
        const observer = new ResizeObserver(() => {
            if (atBottom.current) el.scrollTop = el.scrollHeight;
        });
        observer.observe(el);
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            observer.disconnect();
            el.removeEventListener('scroll', onScroll);
        };
    }, [ref]);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
        atBottom.current = true;
    }, [ref, count]);
}

function ConversationNotFound() {
    const goBack = useGoBack();
    const { go } = useLinks();
    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={copy.notFound.appBar} onBack={goBack} />
            <main className="tl-app-screen__body">
                <EmptyState
                    icon={IconChat}
                    title={copy.notFound.title}
                    text={copy.notFound.text}
                    action={{ label: copy.notFound.action, onClick: () => go(paths.mensajes()) }}
                />
            </main>
        </div>
    );
}
