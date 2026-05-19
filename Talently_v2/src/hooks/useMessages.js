// src/hooks/useMessages.js
// Carga mensajes históricos, suscribe a Supabase Realtime,
// y limpia la suscripción al desmontar.
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/supabase';

export default function useMessages(matchId) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef(null);

    // ── Cargar historial de mensajes ──
    useEffect(() => {
        if (!matchId) return;

        const loadMessages = async () => {
            setLoading(true);
            const { data, error } = await db.matches.getMessages(matchId);
            if (error) {
                console.error('[useMessages] Error cargando mensajes:', error);
            }
            setMessages(data || []);
            setLoading(false);
        };

        loadMessages();
    }, [matchId]);

    // ── Suscripción Realtime ──
    useEffect(() => {
        if (!matchId) return;

        const channel = db.matches.subscribe(matchId, (newMessage) => {
            setMessages((prev) => {
                // Si ya existe (mismo UUID), evitar duplicado.
                if (prev.some((m) => m.id === newMessage.id)) return prev;

                // Si es el echo del propio mensaje optimistic, reemplazar
                // en lugar de agregar (evita el bug de mensaje duplicado).
                const optimisticIdx = prev.findIndex((m) =>
                    m._optimistic &&
                    m.sender_id === newMessage.sender_id &&
                    m.content === newMessage.content
                );
                if (optimisticIdx >= 0) {
                    const copy = [...prev];
                    copy[optimisticIdx] = newMessage;
                    return copy;
                }
                return [...prev, newMessage];
            });
        });

        channelRef.current = channel;

        // Cleanup: desuscribir al desmontar
        return () => {
            if (channelRef.current) {
                channelRef.current.unsubscribe();
                channelRef.current = null;
            }
        };
    }, [matchId]);

    // ── Enviar mensaje ──
    const sendMessage = useCallback(async (content) => {
        if (!matchId) return { error: { message: 'Match no disponible' } };
        const trimmed = (content || '').trim();
        if (!trimmed) return { error: { message: 'El mensaje está vacío' } };

        // Optimistic update: agregar inmediatamente
        const optimistic = {
            id: `temp-${Date.now()}`,
            match_id: matchId,
            sender_id: user?.id,
            content: trimmed,
            created_at: new Date().toISOString(),
            _optimistic: true,
        };
        setMessages((prev) => [...prev, optimistic]);

        const { error } = await db.matches.sendMessage(matchId, trimmed);
        if (error) {
            console.error('[useMessages] Error enviando mensaje:', error?.message || error);
            // Revertir optimistic update
            setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
            return { error };  // permite a la vista mostrar feedback al usuario
        }

        // Incrementar estadisticas (no critico — silenciar errores para no romper UX)
        try {
            await db.statistics.increment('messages_sent');
        } catch (statsErr) {
            console.warn('[useMessages] No se pudo incrementar stats:', statsErr);
        }
        return { error: null };
    }, [matchId, user?.id]);

    return {
        messages,
        loading,
        sendMessage,
        myUserId: user?.id,
    };
}
