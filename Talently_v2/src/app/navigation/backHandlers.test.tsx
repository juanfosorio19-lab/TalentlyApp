import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { hasDirtyForm, hasInternalHistory, runWizardBack, useDirtyGuard, useWizardBack } from './backHandlers';

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
function render(node: React.ReactNode) {
    const el = document.createElement('div');
    root = createRoot(el);
    act(() => root!.render(node));
}
afterEach(() => {
    act(() => root?.unmount());
    root = null;
});

function Dirty({ dirty }: { dirty: boolean }) {
    useDirtyGuard(dirty);
    return null;
}

function Wizard({ step, onBack }: { step: number; onBack: () => void }) {
    useWizardBack(() => {
        if (step <= 1) return false;
        onBack();
        return true;
    });
    return null;
}

describe('useDirtyGuard', () => {
    it('refleja el último valor y se limpia al desmontar', () => {
        render(<Dirty dirty={false} />);
        expect(hasDirtyForm()).toBe(false);
        act(() => root!.render(<Dirty dirty />));
        expect(hasDirtyForm()).toBe(true);
        act(() => root!.unmount());
        root = null;
        expect(hasDirtyForm()).toBe(false);
    });
});

describe('useWizardBack', () => {
    it('vuelve al paso anterior solo desde el paso 2 en adelante', () => {
        let backs = 0;
        render(<Wizard step={1} onBack={() => backs++} />);
        expect(runWizardBack()).toBe(false);
        act(() => root!.render(<Wizard step={3} onBack={() => backs++} />));
        expect(runWizardBack()).toBe(true);
        expect(backs).toBe(1);
    });

    it('sin asistente montado no hace nada', () => {
        expect(runWizardBack()).toBe(false);
    });
});

describe('hasInternalHistory', () => {
    it('usa el índice que guarda React Router en history.state', () => {
        window.history.replaceState({ idx: 0 }, '');
        expect(hasInternalHistory()).toBe(false);
        window.history.replaceState({ idx: 2 }, '');
        expect(hasInternalHistory()).toBe(true);
        window.history.replaceState(null, '');
        expect(hasInternalHistory()).toBe(false);
    });
});
