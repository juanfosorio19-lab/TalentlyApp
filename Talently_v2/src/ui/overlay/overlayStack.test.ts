import { describe, expect, it } from 'vitest';
import { closeTopOverlay, hasOpenOverlay, pushOverlay } from './overlayStack';

describe('pila de capas', () => {
    it('cierra primero la de más arriba', () => {
        const closed: string[] = [];
        const popA = pushOverlay(() => closed.push('hoja'));
        const popB = pushOverlay(() => closed.push('diálogo'));
        expect(closeTopOverlay()).toBe(true);
        expect(closed).toEqual(['diálogo']);
        popB();
        expect(closeTopOverlay()).toBe(true);
        expect(closed).toEqual(['diálogo', 'hoja']);
        popA();
        expect(hasOpenOverlay()).toBe(false);
        expect(closeTopOverlay()).toBe(false);
    });

    it('Escape cierra solo la capa de arriba', () => {
        const closed: string[] = [];
        const popA = pushOverlay(() => closed.push('hoja'));
        const popB = pushOverlay(() => closed.push('diálogo'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(closed).toEqual(['diálogo']);
        popB();
        popA();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(closed).toEqual(['diálogo']);
    });
});
