import { afterEach, describe, expect, it } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IconJobFoodEvents } from '../icons';
import { DynamicFields, type DynamicField, type DynamicValues } from './DynamicFields';

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;
function render(node: ReactNode) {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    act(() => root!.render(node));
}
afterEach(() => {
    sent = [];
    act(() => root?.unmount());
    host?.remove();
    root = null;
    host = null;
});

const FIELDS: DynamicField[] = [
    {
        key: 'dress_code',
        kind: 'chips',
        label: 'Vestimenta',
        options: [
            { value: 'propia', label: 'Propia' },
            { value: 'provista', label: 'La entrega el evento' },
        ],
    },
    { key: 'places', kind: 'chips', label: 'Dónde has trabajado', optional: true, multiple: true, options: [{ value: 'eventos', label: 'Eventos' }] },
    { key: 'pay', kind: 'money', label: 'Tarifa por turno', units: ['turno', 'hora', 'a_convenir'] },
];

// Cada valor que el bloque entrega al padre; el último es el que queda guardado.
let sent: DynamicValues[] = [];
const latest = () => sent[sent.length - 1] ?? {};
function Publish({ initial }: { initial: DynamicValues }) {
    const [value, setValue] = useState<DynamicValues>(initial);
    const onChange = (next: DynamicValues) => {
        sent.push(next);
        setValue(next);
    };
    return (
        <DynamicFields title="Para garzón o garzona" icon={IconJobFoodEvents} fields={FIELDS} value={value} onChange={onChange} portal={false} />
    );
}

describe('DynamicFields', () => {
    it('«A convenir» en un monto queda guardado (sin monto y con su unidad)', () => {
        render(<Publish initial={{ pay: { amount: 35000, unit: 'turno' } }} />);
        act(() => document.querySelector<HTMLButtonElement>('.tl-money__unit')!.click());
        act(() => document.querySelector<HTMLInputElement>('.tl-sheet input[type=radio][value="a_convenir"]')!.click());
        expect(latest().pay).toEqual({ amount: null, unit: 'a_convenir' });
        expect(document.querySelector('.tl-money__unit')?.getAttribute('aria-label')).toBe('Unidad: A convenir');
        const input = document.querySelector<HTMLInputElement>('.tl-money input')!;
        expect(input.value).toBe('');
        expect(input.readOnly).toBe(true);
        expect(input.disabled).toBe(false);
    });

    it('los chips de elección única son un radiogroup y «(opcional)» va aparte', () => {
        render(<Publish initial={{ dress_code: 'provista' }} />);
        const group = document.querySelector('[role="radiogroup"]')!;
        const radios = group.querySelectorAll<HTMLButtonElement>('[role="radio"]');
        expect(group.getAttribute('aria-labelledby')).toBeTruthy();
        expect([...radios].map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true']);
        expect([...radios].map((r) => r.tabIndex)).toEqual([-1, 0]);
        expect(radios[0]!.hasAttribute('aria-pressed')).toBe(false);
        act(() => {
            radios[1]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        });
        expect(latest().dress_code).toBe('propia');
        expect(document.querySelector('.tl-chipgroup__label .tl-field__opt')?.textContent).toBe('(opcional)');
    });
});
