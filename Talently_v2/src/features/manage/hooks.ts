// Piezas comunes de GES-01, GES-02 y GES-04: de quién es la publicación, el
// foco después de una acción que quita el botón tocado y los parámetros de la
// URL que deben sobrevivir al volver de una pantalla apilada.
import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getManagedPublication } from '../demo/data';
import { useDemoSession } from '../demo/session';
import { useSessionState, type SessionApplication } from '../demo/sessionStore';
import type { DemoManagedPublication } from '../demo/types';

export type OwnedPublication =
    | { kind: 'missing' }
    | { kind: 'not-owner'; managed: DemoManagedPublication }
    | { kind: 'ok'; managed: DemoManagedPublication };

/**
 * La publicación solo la gestiona quien la publicó (el actor activo). Jorge
 * recién registrado no tiene publicaciones: nunca es dueño de ninguna.
 */
export function useOwnedPublication(publicationId: string | undefined): OwnedPublication {
    const { actor, recienRegistrado } = useDemoSession();
    const managed = publicationId ? getManagedPublication(publicationId) : undefined;
    if (!managed) return { kind: 'missing' };
    if (recienRegistrado || managed.ownerId !== actor.id) return { kind: 'not-owner', managed };
    return { kind: 'ok', managed };
}

/** Postulaciones hechas en la sesión (DET-01): quien postula aparece en GES-02 y GES-04. */
export function useSessionApplications(): ReadonlyMap<string, SessionApplication> {
    return useSessionState().applications;
}

/**
 * Cuando una acción quita del DOM el botón que se tocó (Confirmar, Avanzar,
 * Evaluar), el foco caería en <body>. `focusAfter(fn)` lo lleva a lo que
 * devuelva `fn` después del próximo render, y si hay una hoja abierta
 * (`blocked`), cuando se cierre: después de que la hoja intente devolverlo.
 */
export function usePendingFocus(blocked: boolean): (target: () => HTMLElement | null | undefined) => void {
    const pending = useRef<(() => HTMLElement | null | undefined) | null>(null);
    useEffect(() => {
        if (blocked || !pending.current) return;
        const target = pending.current;
        pending.current = null;
        target()?.focus({ preventScroll: false });
    });
    return useCallback((target) => {
        pending.current = target;
    }, []);
}

/**
 * Un parámetro de la URL que cambia con `replace` (filtros y pestañas
 * internas): así se conserva al volver de una pantalla apilada y no llena el
 * historial. `fallback` es el valor cuando la URL no lo trae; el tercer valor
 * dice si la URL ya lo trae.
 */
export function useReplaceParam(name: string, fallback: string): [string, (next: string) => void, boolean] {
    const [params, setParams] = useSearchParams();
    const present = params.has(name);
    const value = params.get(name) ?? fallback;
    const setValue = useCallback(
        (next: string) => {
            setParams(
                (prev) => {
                    const p = new URLSearchParams(prev);
                    p.set(name, next);
                    return p;
                },
                { replace: true, preventScrollReset: true },
            );
        },
        [name, setParams],
    );
    return [value, setValue, present];
}
