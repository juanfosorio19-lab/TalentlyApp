// src/hooks/useSwipe.js
// Lógica de gestos pointer para swipe de tarjetas
// onPointerDown/Move/Up — sin librerías externas
import { useState, useRef, useCallback } from 'react';

const SWIPE_THRESHOLD = 100;   // px para confirmar swipe
const MAX_ROTATION = 15;       // grados máximos de rotación
const TAP_THRESHOLD = 10;      // px — si se movió menos, es tap

export default function useSwipe({ onSwipe, onTap }) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const startPos = useRef({ x: 0, y: 0 });
    const dragging = useRef(false);

    // Dirección inferida en tiempo real (stamp aparece a partir de 50px)
    const swipeDirection = offset.x > 50 ? 'right' : offset.x < -50 ? 'left' : null;
    const rotation = (offset.x / window.innerWidth) * MAX_ROTATION;

    const handlePointerDown = useCallback((e) => {
        // Capturar pointer para tracking fuera del elemento
        e.currentTarget.setPointerCapture(e.pointerId);
        startPos.current = { x: e.clientX, y: e.clientY };
        dragging.current = true;
        setIsDragging(true);
    }, []);

    const handlePointerMove = useCallback((e) => {
        if (!dragging.current) return;
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        setOffset({ x: dx, y: dy });
    }, []);

    const handlePointerUp = useCallback(() => {
        if (!dragging.current) return;
        dragging.current = false;
        setIsDragging(false);

        const { x, y } = offset;
        const totalMoved = Math.sqrt(x * x + y * y);

        if (totalMoved < TAP_THRESHOLD) {
            // Tap sin arrastre significativo
            onTap?.();
        } else if (Math.abs(x) >= SWIPE_THRESHOLD) {
            const direction = x > 0 ? 'right' : 'left';
            onSwipe?.(direction);
        }

        // Reset offset (la animación de salida la maneja el parent)
        setOffset({ x: 0, y: 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset, onSwipe, onTap]);

    // Swipe programático (botones)
    const triggerSwipe = useCallback((direction) => {
        onSwipe?.(direction);
    }, [onSwipe]);

    const handlers = {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
    };

    return {
        handlers,
        offset,
        rotation,
        isDragging,
        swipeDirection,
        triggerSwipe,
    };
}
