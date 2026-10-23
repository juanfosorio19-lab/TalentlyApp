import { describe, expect, it } from 'vitest';
import { crossLinkFrom } from './hooks';

describe('enlaces cruzados (PRC-01 ↔ MSG-02, PRC-01 ↔ DET-01)', () => {
    it('lee de dónde se abrió la entrada, solo si es una ruta', () => {
        expect(crossLinkFrom({ from: '/mensajes/conv-pedro-taller' })).toBe('/mensajes/conv-pedro-taller');
        expect(crossLinkFrom({ from: 3 })).toBeNull();
        expect(crossLinkFrom({ sheet: 'retirar' })).toBeNull();
        expect(crossLinkFrom(null)).toBeNull();
        expect(crossLinkFrom('/p/empleo')).toBeNull();
    });
});
