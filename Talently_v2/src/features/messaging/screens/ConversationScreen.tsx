// MSG-02 · Conversación (/mensajes/:conversationId, prototipo MSG-02 y
// MSG-02-pedro) y MSG-02b · compartir certificado de antecedentes (flujo 10:
// MSG-02b-pedido, -adjuntar, -compartir, -marta y -marta-no-disponible; la vista
// de la familia es MSG-02b-familia). AppBar de conversación, ContextChip fijo
// bajo el AppBar, mensajes con estados reales (Enviando…, Enviado, Leído, en
// cola sin conexión), tarjetas de sistema y el Composer con su aviso de
// seguridad. Todas las capas van en la URL (spec §5.3 regla 3), así el atrás
// del navegador o de Android cierra la capa y no la conversación:
// ?sheet=adjuntar, ?sheet=certificado (MSG-02b), ?sheet=opciones (menú ⋯),
// ?sheet=reportar (SHT-REPORTE) y ?sheet=bloquear (Dialog).
// Enviar agrega el mensaje a la sesión (demo/conversationState) mientras Supabase está pausado.
import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { AppBar } from '../../../ui/AppBar';
import { Banner } from '../../../ui/Banner';
import { Composer } from '../../../ui/Composer';
import { ContextChip, ContextChipBar, ContextChipInRow, PUBLICATION_TYPES } from '../../../ui/ContextChip';
import { Dialog } from '../../../ui/Dialog';
import { EmptyState } from '../../../ui/EmptyState';
import { IconChat } from '../../../ui/icons';
import { Chat } from '../../../ui/MessageBubble';
import { useSnackbar, type SnackbarTone } from '../../../ui/Snackbar';
import { useGoBack } from '../../../app/BackButtonManager';
import { SOON_MESSAGE, useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import { buildIcs } from '../../../domain/calendario';
import { getConversation, getPublication } from '../../demo/data';
import type { DemoConversation, DemoSystemCard } from '../../demo/types';
import { AttachSheet } from '../components/AttachSheet';
import { CertificateSheet } from '../components/CertificateSheet';
import { ConversationMenuSheet } from '../components/ConversationMenuSheet';
import { MessageList, SHARE_ATTR } from '../components/MessageList';
import { ReportSheet } from '../components/ReportSheet';
import { useChatScroll, useLayerSequence } from '../chatHooks';
import { copy } from '../copy';
import { DEMO_NOW_TIME } from '../../demo/data';
import { INTERVIEW_MINUTES } from '../mock';
import {
    certificateActive,
    certificateIssued,
    certificatePending,
    chatItems,
    contextOf,
    contextPath,
    googleCalendarUrl,
    interviewEvent,
    peerKind,
    peerProfilePath,
    peerVerified,
    viewerWorks,
} from '../model';
import {
    conversationInSession,
    markRead,
    sendMessage,
    setBlocked,
    setDraft,
    shareCertificate,
    stopSharing,
    useConversationState,
} from '../../demo/conversationState';
import { useSessionState } from '../../demo/sessionStore';
import { useOnline } from '../online';
import { useViewer, type Viewer } from '../viewer';
import '../messaging.css';

export const screenId = 'MSG-02';

export function ConversationScreen() {
    const { conversationId } = useParams();
    const viewer = useViewer();
    const { applications } = useSessionState();
    // Jorge recién registrado todavía no tiene conversaciones.
    const conv = conversationId && !viewer.recienRegistrado ? getConversation(conversationId) : undefined;
    // Solo quien participa la ve (RLS de conversations en el spec §7.6), y solo si ya existe en la sesión
    // (la de una postulación que el actor todavía no envía aparece al postular: conversationInSession).
    if (!conv || conv.viewerId !== viewer.viewerId || !conversationInSession(conv, applications)) return <ConversationNotFound />;
    return <Conversation key={conv.id} conv={conv} viewer={viewer} />;
}

function Conversation({ conv, viewer }: { conv: DemoConversation; viewer: Viewer }) {
    const { viewerId } = viewer;
    const goBack = useGoBack();
    const snackbar = useSnackbar();
    const { open, canOpen, linkProps } = useOpenPath();
    const location = useLocation();
    const online = useOnline();
    const state = useConversationState(conv.id);
    const attach = useSheet('adjuntar');
    const cert = useSheet('certificado');
    const menu = useSheet('opciones');
    const report = useSheet('reportar');
    const block = useSheet('bloquear');
    const logRef = useRef<HTMLElement>(null);
    const appBarRef = useRef<HTMLElement>(null);
    const attachRef = useRef<HTMLButtonElement>(null);

    // Abrirla la deja leída: sus no leídos salen de la bandeja y del badge de la pestaña.
    useEffect(() => markRead(conv.id), [conv.id]);

    const items = useMemo(() => chatItems(conv, state), [conv, state]);
    useChatScroll(logRef, items.length, `${conv.id}:${location.key}`);

    const name = conv.con.nombre;
    const kind = peerKind(conv.con);
    const context = contextOf(conv.contexto.tipo, conv.contexto.chip);
    const contextTarget = contextPath(conv, viewerId, canOpen);
    const publicationId = conv.contexto.publicationId;
    const publication = publicationId ? getPublication(publicationId) : undefined;
    // Quien trabaja (conversa con una organización o un hogar) puede compartirlo en toda conversación (M5).
    const canShare = viewerWorks(conv);
    const blocked = state.blocked;

    // Una capa a la vez. Con la conversación bloqueada no hay Adjuntar, certificado ni «¿Bloquear?».
    const attachOpen = attach.open && !blocked;
    const certOpen = canShare && cert.open && !blocked;
    const blockOpen = block.open && !blocked;
    const shown: [string, boolean][] = [
        ['adjuntar', attachOpen],
        ['certificado', certOpen],
        ['opciones', menu.open],
        ['reportar', report.open],
        ['bloquear', blockOpen],
    ];
    const layer = shown.find(([, isOpen]) => isOpen)?.[0] ?? null;
    // Si la capa se abrió desde un enlace, el foco vuelve a quien la abriría en pantalla.
    const moreButton = () => appBarRef.current?.querySelector<HTMLElement>('.tl-appbar__actions button') ?? null;
    const after = useLayerSequence(layer, (closed) =>
        (closed === 'adjuntar' || closed === 'certificado') && attachRef.current ? attachRef.current : moreButton(),
    );

    // En el chat el aviso va sobre el Composer, a la altura de la TabBar (M5 punto 13).
    const toast = (message: string, tone?: SnackbarTone) => snackbar.show({ message, tone, placement: 'tabbar' });
    // El chip y «Ver publicación» llevan a su pantalla si existe; si no, el aviso sobre el Composer.
    const go = (path: string) => (canOpen(path) ? open(path) : toast(SOON_MESSAGE));
    // Perfil público (PRF-10 / PRF-11): enlace real si ya existe; si no, el aviso sobre el Composer.
    const peerPath = peerProfilePath(conv.con);
    const peerLink = canOpen(peerPath) ? linkProps(peerPath) : { href: undefined, onClick: () => toast(SOON_MESSAGE) };

    const addToCalendar = async (card: DemoSystemCard, messageId: string) => {
        const event = interviewEvent(card, copy.chat.interviewWith(name), INTERVIEW_MINUTES, `${conv.id}-${messageId}`);
        if (!event) {
            toast(copy.chat.calendarError, 'error');
            return;
        }
        // En el teléfono, la plantilla de Google Calendar en el navegador del sistema (sin plugin de calendario).
        if (Capacitor.isNativePlatform()) {
            try {
                const { Browser } = await import('@capacitor/browser');
                await Browser.open({ url: googleCalendarUrl(event) });
            } catch {
                toast(copy.chat.calendarError, 'error');
            }
            return;
        }
        const url = URL.createObjectURL(new Blob([buildIcs(event)], { type: 'text/calendar' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'entrevista.ics';
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast(copy.chat.calendarDownloaded, 'success');
    };

    // MSG-02b se abre recién cuando Adjuntar ya cerró: guarda como origen el botón Adjuntar y el foco vuelve ahí.
    const requestCertificate = () => {
        if (certificateActive(state)) after(attach, () => toast(copy.chat.alreadySharing));
        else after(attach, () => cert.show());
    };

    const stop = (shareId: string) => {
        // «Dejar de compartir» desaparece de la tarjeta: el foco pasa a la tarjeta, que sigue en pantalla.
        logRef.current?.querySelector<HTMLElement>(`[${SHARE_ATTR}="${shareId}"]`)?.focus({ preventScroll: true });
        stopSharing(conv.id, shareId);
        toast(copy.chat.stoppedSharing, 'success');
    };

    const openSheet = (show: () => void) => {
        // El aviso anterior no queda flotando sobre la hoja.
        snackbar.hide();
        show();
    };

    return (
        <div className="tl-app-screen msg-chat" data-screen-id={screenId}>
            <AppBar
                ref={appBarRef}
                variant="chat"
                peer={{ name, meta: conv.con.linea, kind, verified: peerVerified(conv.con), href: peerLink.href, onClick: peerLink.onClick }}
                onBack={goBack}
                onMore={() => openSheet(() => menu.show())}
            />
            {!online && <Banner fixed>{copy.chat.offline}</Banner>}
            <ContextChipBar>
                {contextTarget ? (
                    <ContextChip {...context} onClick={() => go(contextTarget)} />
                ) : (
                    // Turno pasado: la publicación ya no existe y el chip solo dice de qué se habló.
                    <ContextChipInRow {...context} />
                )}
            </ContextChipBar>
            <main ref={logRef} className="tl-app-screen__body msg-chat__log">
                {items.length === 0 ? (
                    <EmptyState icon={IconChat} title={copy.chat.emptyTitle} text={copy.chat.emptyText(name)} />
                ) : (
                    <Chat label={copy.chat.label(name)}>
                        <MessageList
                            items={items}
                            peerName={name}
                            onAddToCalendar={(card, id) => void addToCalendar(card, id)}
                            onViewCertificate={() => toast(SOON_MESSAGE)}
                            onStopSharing={stop}
                        />
                    </Chat>
                )}
            </main>
            <Composer
                value={state.draft}
                onChange={(text) => setDraft(conv.id, text)}
                onSend={(text) => sendMessage(conv.id, text, DEMO_NOW_TIME)}
                onAttach={() => openSheet(() => attach.show())}
                attachProps={{ 'aria-haspopup': 'dialog', ref: attachRef }}
                closedReason={blocked ? copy.chat.blocked(name) : undefined}
                notice={conv.certificado && certificatePending(conv, state) ? <Banner>{conv.certificado.aviso}</Banner> : undefined}
            />

            <ConversationMenuSheet
                open={menu.open}
                onClose={menu.hide}
                title={name}
                publication={
                    publication && {
                        title: publication.titulo,
                        icon: PUBLICATION_TYPES[publication.tipo].icon,
                        onOpen: () => after(menu, () => go(paths.publicacion(publication.id))),
                    }
                }
                blocked={blocked}
                // Reportar y Bloquear reemplazan al menú: el atrás vuelve a la conversación, no al menú.
                onReport={() => after(menu, () => report.show())}
                onBlock={() => after(menu, () => block.show())}
                onUnblock={() => {
                    setBlocked(conv.id, false);
                    menu.hide();
                    toast(copy.block.unblocked(name), 'success');
                }}
            />
            <ReportSheet
                open={report.open}
                onClose={report.hide}
                onSend={() => {
                    report.hide();
                    toast(copy.report.sent, 'success');
                }}
            />
            <Dialog
                open={blockOpen}
                onClose={block.hide}
                title={copy.block.title(name)}
                confirmLabel={copy.block.confirm}
                destructive
                onConfirm={() => {
                    // Cierra la conversación y revoca el certificado compartido (spec §10.1.1).
                    setBlocked(conv.id, true);
                    block.hide();
                }}
            >
                {copy.block.text}
            </Dialog>
            <AttachSheet
                open={attachOpen}
                onClose={attach.hide}
                certificate={canShare}
                onCertificate={requestCertificate}
                onSoon={() => {
                    attach.hide();
                    toast(SOON_MESSAGE);
                }}
            />
            {canShare && (
                <CertificateSheet
                    open={certOpen}
                    onClose={cert.hide}
                    peer={{ name, kind, initials: conv.con.iniciales }}
                    issued={certificateIssued(conv)}
                    onShare={() => {
                        shareCertificate(conv.id, DEMO_NOW_TIME);
                        cert.hide();
                    }}
                    onUpload={() => toast(SOON_MESSAGE)}
                />
            )}
        </div>
    );
}

function ConversationNotFound() {
    const goBack = useGoBack();
    const { open } = useOpenPath();
    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={copy.notFound.appBar} onBack={goBack} />
            <main className="tl-app-screen__body">
                <EmptyState
                    icon={IconChat}
                    title={copy.notFound.title}
                    text={copy.notFound.text}
                    action={{ label: copy.notFound.action, onClick: () => open(paths.mensajes(), { replace: true }) }}
                />
            </main>
        </div>
    );
}
