// La navegación de un asistente de publicar (spec §5.3): cada paso vive en la
// URL (/publicar/:tipo/:paso, con replace: el historial guarda una sola
// entrada del asistente y al terminar se reemplaza por el resultado), atrás
// vuelve al paso anterior (useWizardBack), salir desde el paso 1 con cambios
// pregunta «¿Descartar cambios?» (useDirtyGuard) y «Guardar y salir» deja el
// borrador para seguir después desde ese paso.
//
// El atrás del navegador (popstate: el gesto de volver en iOS o en la PWA)
// hace lo mismo que el de Android: useBlocker lo detiene y lo resuelve
// useGoBack (paso anterior o «¿Descartar cambios?» en el paso 1). Y un
// asistente ya publicado no se vuelve a mostrar: si atrás cae en una entrada
// suya (flujo 5: debajo de VER-02 quedan el paso 5 y su hoja de identidad),
// se salta hasta la pantalla de antes.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useNavigationType, type BlockerFunction } from 'react-router-dom';
import { useSnackbar } from '../../../ui/Snackbar';
import { useGoBack } from '../../../app/BackButtonManager';
import { useDirtyGuard, useWizardBack } from '../../../app/navigation/backHandlers';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import type { DemoActorId } from '../../demo/session';
import { copy } from '../copy';
import type { WizardKind } from '../model/publisher';
import { cancelAwaitIdentity, getPublished, type DraftStore } from '../store';
import type { BackGuard } from './BrowserBackGuard';

export const MENU_SHEET = 'opciones';
/** PUBL-01 «¿Qué quieres publicar?», la hoja de Inicio que abre los asistentes. */
const PUBLISH_SHEET = 'publicar';

interface WizardOptions<T> {
    kind: WizardKind;
    step: number;
    actorId: DemoActorId;
    store: DraftStore<T>;
    initial: T;
    /** El borrador cambió respecto de con lo que partió. */
    changed: boolean;
}

/** Historial de React Router: cuántas entradas hay antes de la actual. */
const historyIndex = (): number => {
    const state = window.history.state as { idx?: number } | null;
    return typeof state?.idx === 'number' ? state.idx : 0;
};

/** Ruta y búsqueda de la entrada actual del navegador (HashRouter: `#/publicar/hogar/5?sheet=…`). */
function currentEntry(): { pathname: string; params: URLSearchParams } {
    const [pathname = '', search = ''] = window.location.hash.replace(/^#/, '').split('?');
    return { pathname, params: new URLSearchParams(search) };
}

/** La entrada actual es un paso de este asistente (con o sin una hoja suya encima). */
const onWizardEntry = (kind: WizardKind): boolean => new RegExp(`^/publicar/${kind}/\\d+$`).test(currentEntry().pathname);

/** La entrada actual es la hoja PUBL-01 que abrió la app (useSheet guarda `{ sheet }` en el estado). */
function onPublishSheetEntry(): boolean {
    const state = window.history.state as { usr?: { sheet?: string } | null } | null;
    return state?.usr?.sheet === PUBLISH_SHEET && currentEntry().params.get('sheet') === PUBLISH_SHEET;
}

/**
 * Retrocede `steps` entradas y sigue retrocediendo mientras caiga en algo que
 * ya no corresponde mostrar (`skip`). Escucha popstate fuera de React porque
 * el asistente se desmonta en el camino. Sin historial suficiente, `fallback`.
 */
function backPast(steps: number, skip: () => boolean, fallback: () => void): void {
    if (historyIndex() < steps) {
        fallback();
        return;
    }
    const onPop = () => {
        if (!skip()) {
            window.removeEventListener('popstate', onPop);
            return;
        }
        if (historyIndex() > 0) {
            window.history.back();
            return;
        }
        window.removeEventListener('popstate', onPop);
        fallback();
    };
    window.addEventListener('popstate', onPop);
    window.history.go(-steps);
}

export function useWizard<T>({ kind, step, actorId, store, initial, changed }: WizardOptions<T>) {
    const navigate = useNavigate();
    const navigationType = useNavigationType();
    const location = useLocation();
    const snackbar = useSnackbar();
    const goBack = useGoBack();
    const { canOpen, soon } = useOpenPath();
    const menu = useSheet(MENU_SHEET);
    const entry = store.useEntry(actorId);
    const saved = entry?.saved ?? false;

    // Atrás (del navegador o de una pantalla de más arriba) cayó en un asistente que ya se publicó y
    // cuyo borrador se descartó: no se arma de nuevo con el borrador inicial (spec §5.3 regla 6).
    // Solo entradas que creó la app (con `idx`): una URL escrita a mano abre el asistente de nuevo.
    const [skipping] = useState(
        () =>
            navigationType === 'POP' &&
            typeof (window.history.state as { idx?: number } | null)?.idx === 'number' &&
            !store.get(actorId) &&
            getPublished(actorId, kind) !== undefined,
    );

    /** Salir lo pidió la app («Guardar y salir», «Descartar» o saltar lo ya publicado): el atrás no se detiene. */
    const leavingRef = useRef(skipping);
    /** Índice de esta entrada en el historial: un popstate hacia uno mayor es «adelante». */
    const indexRef = useRef(historyIndex());
    const stepRef = useRef(step);
    const changedRef = useRef(changed);
    const initialRef = useRef(initial);
    useEffect(() => {
        stepRef.current = step;
        changedRef.current = changed;
        initialRef.current = initial;
    });
    useEffect(() => {
        indexRef.current = historyIndex();
    }, [location.key]);

    const goTo = useCallback((n: number) => navigate(paths.publicar(kind, n), { replace: true }), [kind, navigate]);

    // Atrás (Android, el del AppBar o el del navegador): el paso anterior; en el paso 1 sigue el historial.
    useWizardBack(() => {
        if (step <= 1) {
            // Ya pasó por «¿Descartar cambios?» (o no había nada que perder): ahora sí sale.
            leavingRef.current = true;
            return false;
        }
        goTo(step - 1);
        return true;
    });

    // Solo al salir del asistente (paso 1) se pierde algo: en los demás, atrás es el paso anterior.
    useDirtyGuard(step === 1 && changed && !saved);

    // El atrás del navegador que saca del asistente se detiene y se resuelve como el de Android.
    const shouldBlock = useCallback<BlockerFunction>(
        ({ historyAction, nextLocation }) => {
            if (historyAction !== 'POP' || leavingRef.current) return false;
            // Adelante (de vuelta a VER-02 o a Ayuda, que guardaron el borrador) no es atrás.
            if (historyIndex() > indexRef.current) return false;
            // Cerrar una hoja del asistente (?sheet=…) no sale de él.
            if (nextLocation.pathname.startsWith(`/publicar/${kind}/`)) return false;
            if (stepRef.current > 1) return true;
            return changedRef.current && !store.get(actorId)?.saved;
        },
        [actorId, kind, store],
    );
    const stopWaiting = useRef<(() => void) | null>(null);
    const onBlocked = useCallback(() => {
        // El router devuelve la URL a este paso (history.go); se actúa cuando ya volvió, así el
        // replace del paso anterior cae sobre la entrada del asistente y no sobre la de antes.
        stopWaiting.current?.();
        const here = `#${location.pathname}${location.search}`;
        const run = () => {
            stopWaiting.current = null;
            goBack();
        };
        if (window.location.hash === here) {
            run();
            return;
        }
        const onPop = () => {
            window.removeEventListener('popstate', onPop);
            run();
        };
        window.addEventListener('popstate', onPop);
        stopWaiting.current = () => window.removeEventListener('popstate', onPop);
    }, [goBack, location.pathname, location.search]);
    const backGuard: BackGuard = { active: !skipping && (step > 1 || (changed && !saved)), shouldBlock, onBlocked };

    // Saltar lo ya publicado: hasta la pantalla de antes del asistente (sin la hoja PUBL-01).
    const skipped = useRef(false);
    useEffect(() => {
        if (!skipping || skipped.current) return;
        skipped.current = true;
        backPast(1, () => onWizardEntry(kind) || onPublishSheetEntry(), () => navigate(paths.inicio(), { replace: true }));
    }, [kind, navigate, skipping]);

    // Volver con el borrador guardado: sigue desde el paso en que salió. Solo al abrir el asistente.
    const [resumeTo] = useState(() => (!skipping && step === 1 && entry?.saved && entry.savedStep > 1 ? entry.savedStep : null));
    const resumed = useRef(false);
    useEffect(() => {
        if (!resumeTo || resumed.current) return;
        resumed.current = true;
        goTo(resumeTo);
    }, [resumeTo, goTo]);

    // Al desmontar: «Descartar» (o salir sin cambios) borra lo escrito; cualquier otra salida que no
    // pasó por el asistente (un atrás que el navegador no deja detener) lo guarda para seguir después.
    useEffect(
        () => () => {
            stopWaiting.current?.();
            // Salió del asistente (no hacia VER-02): PUBL-07 ya no termina de publicar por su cuenta.
            if (leavingRef.current) cancelAwaitIdentity(actorId, kind);
            const current = store.get(actorId);
            if (!current || current.saved) return;
            if (leavingRef.current || !changedRef.current) store.discard(actorId);
            else store.save(actorId, initialRef.current, stepRef.current);
        },
        [actorId, kind, store],
    );

    // La hoja de opciones la abrió la app (push): cerrarla es volver una entrada.
    const menuPushed = menu.open && (location.state as { sheet?: string } | null)?.sheet === MENU_SHEET;

    /**
     * Deja el asistente: vuelve a la pantalla de antes (sin la hoja de opciones
     * ni la hoja PUBL-01 de Inicio desde la que se abrió) o, sin historial, a Inicio.
     */
    const leave = useCallback(() => {
        leavingRef.current = true;
        backPast(menuPushed ? 2 : 1, onPublishSheetEntry, () => navigate(paths.inicio(), { replace: true }));
    }, [menuPushed, navigate]);

    const saveAndExit = useCallback(() => {
        store.save(actorId, initial, step);
        leave();
        snackbar.show({ message: copy.menu.guardado, tone: 'success' });
    }, [actorId, initial, leave, snackbar, step, store]);

    /**
     * «Ayuda» deja el borrador guardado: al volver, sigue en este paso. La
     * Ayuda reemplaza la entrada de la hoja, así atrás vuelve al paso sin ella.
     */
    const help = useCallback(() => {
        if (!canOpen(paths.ayuda())) {
            menu.hide();
            soon();
            return;
        }
        store.save(actorId, initial, step);
        navigate(paths.ayuda(), { replace: menuPushed });
    }, [actorId, canOpen, initial, menu, menuPushed, navigate, soon, step, store]);

    return { goTo, menu, saveAndExit, help, skipping, backGuard };
}
