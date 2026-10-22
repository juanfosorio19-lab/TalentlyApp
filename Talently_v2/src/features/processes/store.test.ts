import { afterEach, describe, expect, it } from 'vitest';
import { getReview, isWithdrawn, resetProcesses, sendReview, withdraw } from './store';

afterEach(() => resetProcesses());

describe('store de Procesos y reseñas', () => {
    it('retirar queda por actor y proceso', () => {
        expect(isWithdrawn('jorge', 'proc-jorge-guardia-4x4')).toBe(false);
        withdraw('jorge', 'proc-jorge-guardia-4x4');
        withdraw('jorge', 'proc-jorge-guardia-4x4');
        expect(isWithdrawn('jorge', 'proc-jorge-guardia-4x4')).toBe(true);
        expect(isWithdrawn('pedro', 'proc-jorge-guardia-4x4')).toBe(false);
    });

    it('la evaluación enviada se guarda por actor y publicación', () => {
        sendReview('matias', 'turno-garzones-finde-5dic', { rating: 5, tags: ['Pago a tiempo'], comment: 'Todo bien' });
        expect(getReview('matias', 'turno-garzones-finde-5dic')).toMatchObject({ rating: 5, tags: ['Pago a tiempo'] });
        expect(getReview('jorge', 'turno-garzones-finde-5dic')).toBeUndefined();
    });
});
