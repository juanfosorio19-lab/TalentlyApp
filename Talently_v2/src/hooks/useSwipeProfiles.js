// src/hooks/useSwipeProfiles.js
// Carga perfiles para explorar desde Supabase, filtra ya swipeados,
// maneja currentIndex en AppContext, registra swipes y detecta matches.
import { useState, useEffect, useCallback } from 'react';
import { useApp, Actions } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/supabase';

export default function useSwipeProfiles() {
    const { state, dispatch } = useApp();
    const { user, userType } = useAuth();
    const [loading, setLoading] = useState(true);
    const [matchResult, setMatchResult] = useState(null); // { matchId, matchedProfile }

    const { profiles, currentIndex } = state;
    const currentProfile = profiles[currentIndex] || null;

    // ── Carga inicial de perfiles ──
    useEffect(() => {
        if (!user || !userType) return;

        const loadProfiles = async () => {
            setLoading(true);
            try {
                // 1. Obtener IDs ya swipeados
                const { data: swipedIds } = await db.swipes.getSwipedUserIds();

                // 2. Obtener perfiles del tipo opuesto
                const { data: allProfiles, error } = await db.profiles.getDiscovery(userType);
                if (error) {
                    console.error('[useSwipeProfiles] Error cargando perfiles:', error);
                    return;
                }

                // 3. Filtrar los ya swipeados
                let filtered = (allProfiles || []).filter(
                    (p) => !swipedIds.includes(p.id) && p.id !== user.id
                );

                // 4. Aplicar filtros del candidato (cliente-side)
                if (userType === 'candidate') {
                    const f = state.candidateFilters;
                    if (f.modality?.length > 0) {
                        filtered = filtered.filter((p) =>
                            f.modality.some((m) =>
                                (p.work_modality || '').toLowerCase().includes(m.toLowerCase())
                            )
                        );
                    }
                    if (f.areas?.length > 0) {
                        filtered = filtered.filter((p) =>
                            f.areas.some((a) =>
                                (p.professional_area || p.area || '').toLowerCase().includes(a.toLowerCase())
                            )
                        );
                    }
                    if (f.country) {
                        filtered = filtered.filter((p) =>
                            (p.country || '').toLowerCase() === f.country.toLowerCase()
                        );
                    }
                    if (f.salary?.min != null) {
                        filtered = filtered.filter((p) =>
                            (p.salary_max ?? p.expected_salary ?? Infinity) >= f.salary.min
                        );
                    }
                    if (f.salary?.max != null) {
                        filtered = filtered.filter((p) =>
                            (p.salary_min ?? p.expected_salary ?? 0) <= f.salary.max
                        );
                    }
                    if (f.stage?.length > 0) {
                        filtered = filtered.filter((p) =>
                            f.stage.some((s) =>
                                (p.company_stage || p.stage || '').toLowerCase().includes(s.toLowerCase())
                            )
                        );
                    }
                }

                dispatch({ type: Actions.SET_PROFILES, payload: filtered });
            } catch (err) {
                console.error('[useSwipeProfiles] Error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProfiles();
    }, [user, userType, state.candidateFilters, dispatch]);

    // ── Avanzar al siguiente perfil ──
    const advance = useCallback(() => {
        dispatch({ type: Actions.ADVANCE_INDEX });
    }, [dispatch]);

    // ── Registrar swipe + verificar match ──
    const handleSwipe = useCallback(async (direction) => {
        if (!currentProfile) return { isMutualMatch: false };

        try {
            const { isMutualMatch } = await db.swipes.create(
                currentProfile.id,
                direction === 'right' ? 'right' : 'left'
            );

            // Incrementar estadísticas
            await db.statistics.increment('swipes_given');

            if (isMutualMatch) {
                // Crear el match
                const { data: matchData } = await db.matches.create(currentProfile.id);
                await db.statistics.increment('matches_count');
                await db.statistics.incrementForUser(currentProfile.id, 'matches_count');

                setMatchResult({
                    matchId: matchData?.id,
                    matchedProfile: currentProfile,
                });

                // Notificar a ambos usuarios sin bloquear el flujo
                try {
                    const myName = state.userProfile?.full_name
                        || state.userProfile?.company_name
                        || 'Alguien';
                    const otherName = currentProfile.full_name
                        || currentProfile.company_name
                        || 'Alguien';
                    const matchId = matchData?.id || null;

                    await Promise.all([
                        db.notifications.create({
                            user_id: user.id,
                            type: 'match',
                            title: '¡Nuevo Match!',
                            message: `${otherName} también está interesado en ti.`,
                            related_id: matchId,
                        }),
                        db.notifications.create({
                            user_id: currentProfile.id,
                            type: 'match',
                            title: '¡Nuevo Match!',
                            message: `${myName} también está interesado en ti.`,
                            related_id: matchId,
                        }),
                    ]);
                } catch (e) {
                    console.warn('[Notifications] No se pudo crear notificación de match:', e);
                }
            }

            // Avanzar al siguiente
            advance();
            return { isMutualMatch };
        } catch (err) {
            console.error('[useSwipeProfiles] Error en swipe:', err);
            advance();
            return { isMutualMatch: false };
        }
    }, [currentProfile, state.userProfile, user, advance]);

    // ── Limpiar resultado de match ──
    const clearMatchResult = useCallback(() => {
        setMatchResult(null);
    }, []);

    return {
        profiles,
        currentProfile,
        nextProfile: profiles[currentIndex + 1] || null,
        loading,
        noMoreProfiles: !loading && currentIndex >= profiles.length,
        matchResult,
        handleSwipe,
        advance,
        clearMatchResult,
    };
}
