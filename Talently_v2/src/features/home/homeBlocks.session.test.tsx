// Inicio al día con la sesión: los bloques salen de los datos y se cruzan con
// las postulaciones de demo/sessionStore (useApplications, el mismo hook que
// usan ACT-02 y PRC-01), así Inicio nunca dice lo contrario que esas pantallas.
import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { getHomeFeed } from '../demo/data';
import type { DemoActorId } from '../demo/session';
import { applyTo, cancelShift, resetSession, useApplications } from '../demo/sessionStore';
import type { DemoApplication, DemoHomeBlock } from '../demo/types';
import { homeBlocks } from './selectors';

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Las postulaciones del actor tal como las ve la sesión (lo que recibe HomeScreen). */
function sessionApplications(actorId: DemoActorId, recienRegistrado = false): DemoApplication[] {
    let result: DemoApplication[] = [];
    function Probe({ onValue }: { onValue: (apps: DemoApplication[]) => void }) {
        const apps = useApplications(actorId, recienRegistrado);
        useEffect(() => onValue(apps), [apps, onValue]);
        return null;
    }
    const root = createRoot(document.createElement('div'));
    act(() =>
        root.render(
            <Probe
                onValue={(apps) => {
                    result = apps;
                }}
            />,
        ),
    );
    act(() => root.unmount());
    return result;
}

function blocksOf(actorId: DemoActorId, recienRegistrado = false): DemoHomeBlock[] {
    const feed = getHomeFeed(actorId, { recienRegistrado });
    return homeBlocks(feed.bloques, { applications: sessionApplications(actorId, recienRegistrado), cvSubido: false });
}

const news = (blocks: readonly DemoHomeBlock[]) => {
    const b = blocks.find((x) => x.tipo === 'novedades');
    return b?.tipo === 'novedades' ? b : undefined;
};

afterEach(() => resetSession());

describe('INI-01 · «Postulaciones con novedades» solo de lo que la sesión tiene', () => {
    it('Pedro parte sin postular a Mecánico/a automotriz (flujo 3): sin «te citó a entrevista»', () => {
        expect(news(blocksOf('pedro'))).toBeUndefined();
    });

    it('después de postular en la sesión, Pedro ve su entrevista', () => {
        applyTo('pedro', 'empleo-mecanico-automotriz', 'Postulado');
        const block = news(blocksOf('pedro'));
        expect(block?.items.map((n) => n.id)).toEqual(['nov-pedro-entrevista']);
    });

    it('Jorge solo ve la de Hotel Andino hasta que postula a Guardia 4x4', () => {
        expect(news(blocksOf('jorge'))?.items.map((n) => n.id)).toEqual(['nov-jorge-hotel']);
        applyTo('jorge', 'empleo-guardia-4x4', 'Postulado');
        expect(news(blocksOf('jorge'))?.items.map((n) => n.id)).toEqual(['nov-jorge-entrevista', 'nov-jorge-hotel']);
    });

    it('la de Matías (Hotel Andino vio tu postulación) sigue: esa postulación existe', () => {
        expect(news(blocksOf('matias'))?.items.map((n) => n.id)).toEqual(['nov-matias-cena']);
    });

    it('un turno cancelado sigue siendo una postulación (no borra sus novedades)', () => {
        cancelShift('app-matias-coctel');
        expect(news(blocksOf('matias'))?.items).toHaveLength(1);
    });
});

describe('INI-01-jorge-nuevo · después de postular ya no está «sin actividad»', () => {
    it('sin postular: «Aún no tienes actividad» y la credencial SPD', () => {
        expect(blocksOf('jorge', true).map((b) => b.tipo)).toEqual(['vacio', 'completar']);
    });

    it('al postular a Guardia 4x4, el vacío pasa a «Tus postulaciones» con esa fila', () => {
        applyTo('jorge', 'empleo-guardia-4x4', 'Postulado');
        const blocks = blocksOf('jorge', true);
        expect(blocks.map((b) => b.tipo)).toEqual(['novedades', 'completar']);
        const block = news(blocks);
        expect(block?.titulo).toBe('Tus postulaciones');
        expect(block?.items).toEqual([
            expect.objectContaining({
                titulo: 'Guardia de seguridad 4x4',
                estado: 'Postulado',
                destino: { pantalla: 'publicacion', publicationId: 'empleo-guardia-4x4' },
            }),
        ]);
    });

    it('Rosa sin postulaciones sigue con «Aún no tienes perfiles»', () => {
        expect(blocksOf('rosa').map((b) => b.tipo)).toEqual(['vacio']);
    });
});
