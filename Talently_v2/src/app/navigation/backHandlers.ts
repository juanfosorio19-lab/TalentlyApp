// Manejadores que el BackButtonManager consulta, en este orden (spec §5.3 r.4):
//   1. capa abierta (BottomSheet, Dialog…)  → src/ui/overlay
//   2. formulario con cambios sin guardar   → useDirtyGuard()
//   3. paso N > 1 de un asistente           → useWizardBack()
//   4. historial interno                    → navigate(-1)
//   5. pestaña distinta de Inicio           → Inicio con replace
//   6. Inicio                               → «Presiona atrás otra vez para salir»
// Las pantallas nunca registran su propio listener de Capacitor.
import { useEffect, useRef } from 'react';

type Guard = { id: number; isDirty: () => boolean };
type WizardBack = { id: number; back: () => boolean };

const dirtyGuards: Guard[] = [];
const wizardBacks: WizardBack[] = [];
let nextId = 1;

/** Marca la pantalla como formulario con cambios: atrás pregunta «¿Descartar cambios?». */
export function useDirtyGuard(dirty: boolean): void {
    const ref = useRef(dirty);
    useEffect(() => {
        ref.current = dirty;
    });
    useEffect(() => {
        const g: Guard = { id: nextId++, isDirty: () => ref.current };
        dirtyGuards.push(g);
        return () => {
            const i = dirtyGuards.indexOf(g);
            if (i !== -1) dirtyGuards.splice(i, 1);
        };
    }, []);
}

export function hasDirtyForm(): boolean {
    return dirtyGuards.some((g) => g.isDirty());
}

/**
 * Asistentes: `back()` vuelve al paso anterior y devuelve true; en el paso 1
 * devuelve false y el manager sigue con el historial.
 */
export function useWizardBack(back: () => boolean): void {
    const ref = useRef(back);
    useEffect(() => {
        ref.current = back;
    });
    useEffect(() => {
        const w: WizardBack = { id: nextId++, back: () => ref.current() };
        wizardBacks.push(w);
        return () => {
            const i = wizardBacks.indexOf(w);
            if (i !== -1) wizardBacks.splice(i, 1);
        };
    }, []);
}

export function runWizardBack(): boolean {
    const top = wizardBacks[wizardBacks.length - 1];
    return top ? top.back() : false;
}

/** Índice de React Router en el historial: > 0 = hay historial interno. */
export function hasInternalHistory(): boolean {
    const state = window.history.state as { idx?: number } | null;
    return typeof state?.idx === 'number' && state.idx > 0;
}
