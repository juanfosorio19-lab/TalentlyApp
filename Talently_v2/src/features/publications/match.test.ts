import { describe, expect, it } from 'vitest';
import { DEMO_ACTORS } from '../demo/session';
import type { PendingMatch } from '../demo/sessionStore';
import { matchView, nextMatch, shortOrgName } from './match';

const pending = (list: PendingMatch[]) => new Map(list.map((m) => [`${m.actorId}:${m.publicationId}`, m]));

describe('DET-03 · match', () => {
    it('quita solo la razón social del nombre', () => {
        expect(shortOrgName('Seguridad Andes Ltda.')).toBe('Seguridad Andes');
        expect(shortOrgName('Banquetería Rosa SpA')).toBe('Banquetería Rosa');
        expect(shortOrgName('Taller Los Aromos')).toBe('Taller Los Aromos');
    });

    it('muestra primero el que vence antes y solo los del actor', () => {
        const map = pending([
            { actorId: 'pedro', publicationId: 'b', dueAt: 20 },
            { actorId: 'jorge', publicationId: 'c', dueAt: 5 },
            { actorId: 'pedro', publicationId: 'a', dueAt: 10 },
        ]);
        expect(nextMatch(map, 'pedro')?.publicationId).toBe('a');
        expect(nextMatch(map, 'matias')).toBeUndefined();
    });

    it('arma el texto de Pedro y Taller Los Aromos con su conversación', () => {
        const view = matchView({ actorId: 'pedro', publicationId: 'empleo-mecanico-automotriz', dueAt: 0 }, DEMO_ACTORS.pedro);
        expect(view).toMatchObject({
            person: 'Pedro Valdés',
            org: { name: 'Taller Los Aromos', shortName: 'Taller Los Aromos' },
            publication: 'Mecánico/a automotriz',
        });
        expect(view?.conversationId).toBeTruthy();
    });

    it('sin conversación a la que llevar, no hay match que mostrar', () => {
        expect(matchView({ actorId: 'matias', publicationId: 'turno-garzones-matrimonio', dueAt: 0 }, DEMO_ACTORS.matias)).toBeUndefined();
        expect(matchView({ actorId: 'pedro', publicationId: 'no-existe', dueAt: 0 }, DEMO_ACTORS.pedro)).toBeUndefined();
    });
});
