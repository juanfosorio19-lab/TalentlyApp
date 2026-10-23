import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { resetProcesses, useChecklist } from './store';

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => resetProcesses());

type Checklist = ReturnType<typeof useChecklist>;

/** Monta useChecklist y devuelve siempre el último valor. */
function mountChecklist(actorId: 'carolina' | 'jorge', processId: string, initial: readonly boolean[]): { current: Checklist } {
    const latestRef: { current: Checklist } = { current: [initial, () => undefined] };
    function Probe({ onValue }: { onValue: (value: Checklist) => void }) {
        const value = useChecklist(actorId, processId, initial);
        useEffect(() => onValue(value), [value, onValue]);
        return null;
    }
    const root = createRoot(document.createElement('div'));
    const onValue = (value: Checklist) => {
        latestRef.current = value;
    };
    act(() => root.render(<Probe onValue={onValue} />));
    return latestRef;
}

describe('store de Procesos (checklist del hogar)', () => {
    it('parte con lo de los datos y guarda lo marcado por actor y proceso', () => {
        const initial = [true, false, false];
        const carolina = mountChecklist('carolina', 'proc-carolina-marta', initial);
        expect(carolina.current[0]).toEqual([true, false, false]);
        act(() => carolina.current[1](1, true));
        expect(carolina.current[0]).toEqual([true, true, false]);
        const jorge = mountChecklist('jorge', 'proc-carolina-marta', initial);
        expect(jorge.current[0]).toEqual([true, false, false]);
    });
});
