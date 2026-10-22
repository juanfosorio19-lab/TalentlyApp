import { afterEach, describe, expect, it } from 'vitest';
import { getReview, isWithdrawn, resetProcesses, sendReview, stillWithdrawn, withdraw } from './store';

afterEach(() => resetProcesses());

describe('store de Procesos y reseñas', () => {
    it('retirar queda por actor y proceso', () => {
        expect(isWithdrawn('jorge', 'proc-jorge-guardia-4x4')).toBe(false);
        withdraw('jorge', 'proc-jorge-guardia-4x4');
        withdraw('jorge', 'proc-jorge-guardia-4x4');
        expect(isWithdrawn('jorge', 'proc-jorge-guardia-4x4')).toBe(true);
        expect(isWithdrawn('pedro', 'proc-jorge-guardia-4x4')).toBe(false);
    });

    it('volver a postular después de retirar deja la postulación en pie', () => {
        withdraw('pedro', 'proc-pedro-mecanico', 2000);
        expect(isWithdrawn('pedro', 'proc-pedro-mecanico')).toBe(true);
        // Postuló antes de retirar: sigue retirada.
        expect(isWithdrawn('pedro', 'proc-pedro-mecanico', 1000)).toBe(true);
        // Postuló de nuevo después: ya no.
        expect(isWithdrawn('pedro', 'proc-pedro-mecanico', 3000)).toBe(false);
        // Y si retira otra vez, cuenta la última.
        withdraw('pedro', 'proc-pedro-mecanico', 4000);
        expect(isWithdrawn('pedro', 'proc-pedro-mecanico', 3000)).toBe(true);
        expect(stillWithdrawn(undefined, 3000)).toBe(false);
    });

    it('la evaluación enviada se guarda por actor y publicación', () => {
        sendReview('matias', 'turno-garzones-finde-5dic', { rating: 5, tags: ['Pago a tiempo'], comment: 'Todo bien' });
        expect(getReview('matias', 'turno-garzones-finde-5dic')).toMatchObject({ rating: 5, tags: ['Pago a tiempo'] });
        expect(getReview('jorge', 'turno-garzones-finde-5dic')).toBeUndefined();
    });
});
