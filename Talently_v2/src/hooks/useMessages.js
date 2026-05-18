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
                // Evitar duplicados (puede llegar el que acabamos de enviar)
                if (prev.some((m) => m.id === newMessage.id)) return prev;
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
        if (!matchId || !content.trim()) return;

        const trimmed = content.trim();

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
            console.error('[useMessages] Error enviando mensaje:', error);
            // Revertir optimistic update
            setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        }

        // Incrementar estadísticas
        await db.statistics.increment('messages_sent');
    }, [matchId, user?.id]);

    return {
        messages,
        loading,
        sendMessage,
        myUserId: user?.id,
    };
}
