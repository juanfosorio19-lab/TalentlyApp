// src/components/swipe/SwipeStack.jsx
// Stack de tarjetas con gestos de swipe y botones de acción
import { useState, useCallback } from 'react';
import SwipeCard from './SwipeCard';
import MatchModal from './MatchModal';
import useSwipe from '../../hooks/useSwipe';
import useSwipeProfiles from '../../hooks/useSwipeProfiles';
import './SwipeStack.css';

export default function SwipeStack({ onCardTap }) {
    const {
        currentProfile,
        nextProfile,
        loading,
        noMoreProfiles,
        matchResult,
        handleSwipe,
        clearMatchResult,
    } = useSwipeProfiles();

    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [exitDirection, setExitDirection] = useState(null);

    // Callback cuando se confirma un swipe (gesto o botón)
    const onSwipeConfirmed = useCallback(async (direction) => {
        if (isAnimatingOut) return;

        setIsAnimatingOut(true);
        setExitDirection(direction);

        // Registrar el swipe en backend
        await handleSwipe(direction);

        // Pequeño delay para la animación de salida
        setTimeout(() => {
            setIsAnimatingOut(false);
            setExitDirection(null);
        }, 100);
    }, [handleSwipe, isAnimatingOut]);

    const {
        handlers,
        offset,
        rotation,
        isDragging,
        swipeDirection,
        triggerSwipe,
    } = useSwipe({
        onSwipe: onSwipeConfirmed,
        onTap: currentProfile && onCardTap ? () => onCardTap(currentProfile) : undefined,
    });

    // ── Transform de la tarjeta frontal ──
    const getFrontCardStyle = () => {
        if (isAnimatingOut && exitDirection) {
            const xOut = exitDirection === 'right' ? 500 : -500;
            return {
                transform: `translateX(${xOut}px) rotate(${exitDirection === 'right' ? 30 : -30}deg)`,
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: 0,
            };
        }

        if (isDragging) {
            return {
                transform: `translateX(${offset.x}px) translateY(${offset.y * 0.3}px) rotate(${rotation}deg)`,
                transition: 'none',
            };
        }

        return {
            transform: 'translateX(0) rotate(0deg)',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        };
    };

    // ── Loading ──
    if (loading) {
        return (
            <div className="swipe-stack">
                <div className="swipe-stack__loading">
                    <div className="swipe-stack__spinner" />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Cargando perfiles...
                    </p>
                </div>
            </div>
        );
    }

    // ── Sin perfiles ──
    if (noMoreProfiles) {
        return (
            <div className="swipe-stack">
                <div className="swipe-stack__empty">
                    <span className="material-symbols-rounded swipe-stack__empty-icon">
                        explore_off
                    </span>
                    <h3 className="swipe-stack__empty-title">
                        ¡Ya exploraste todo!
                    </h3>
                    <p className="swipe-stack__empty-text">
                        No hay más perfiles por ahora. Vuelve más tarde para descubrir nuevas oportunidades.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="swipe-stack">
            {/* Stack de tarjetas */}
            <div className="swipe-stack__cards">
                {/* Tarjeta trasera (siguiente) */}
                {nextProfile && (
                    <SwipeCard
                        key={`behind-${nextProfile.id}`}
                        profile={nextProfile}
                        isFront={false}
                        style={{
                            transform: 'scale(0.95) translateY(8px)',
                            opacity: 0.7,
                            zIndex: 1,
                        }}
                    />
                )}

                {/* Tarjeta frontal con gestos */}
                {currentProfile && (
                    <div
                        {...handlers}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 2,
                            ...getFrontCardStyle(),
                        }}
                    >
                        <SwipeCard
                            key={`front-${currentProfile.id}`}
                            profile={currentProfile}
                            isFront={true}
                            swipeDirection={swipeDirection}
                        />
                    </div>
                )}
            </div>

            {/* Botones de acción */}
            <div className="swipe-stack__actions">
                <button
                    className="swipe-stack__btn swipe-stack__btn--nope"
                    onClick={() => triggerSwipe('left')}
                    disabled={isAnimatingOut || !currentProfile}
                    aria-label="No me interesa"
                >
                    <span className="material-symbols-rounded">close</span>
                </button>

                <button
                    className="swipe-stack__btn swipe-stack__btn--like"
                    onClick={() => triggerSwipe('right')}
                    disabled={isAnimatingOut || !currentProfile}
                    aria-label="Me interesa"
                >
                    <span className="material-symbols-rounded">favorite</span>
                </button>

                <button
                    className="swipe-stack__btn swipe-stack__btn--info"
                    onClick={() => {/* TODO: expandir perfil */ }}
                    disabled={!currentProfile}
                    aria-label="Ver más información"
                >
                    <span className="material-symbols-rounded">info</span>
                </button>
            </div>

            {/* Modal de Match */}
            {matchResult && (
                <MatchModal
                    matchedProfile={matchResult.matchedProfile}
                    matchId={matchResult.matchId}
                    onClose={clearMatchResult}
                />
            )}
        </div>
    );
}
