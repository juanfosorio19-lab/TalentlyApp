// La navegación de un asistente de publicar (spec §5.3): cada paso vive en la
// URL (/publicar/:tipo/:paso, con replace: el historial guarda una sola
// entrada del asistente y al terminar se reemplaza por el resultado), atrás
// vuelve al paso anterior (useWizardBack), salir desde el paso 1 con cambios
// pregunta «¿Descartar cambios?» (useDirtyGuard) y «Guardar y salir» deja el
// borrador para seguir después desde ese paso.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../../ui/Snackbar';
import { useDirtyGuard, useWizardBack } from '../../../app/navigation/backHandlers';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import type { DemoActorId } from '../../demo/session';
import { copy } from '../copy';
import type { WizardKind } from '../model/publisher';
import type { DraftStore } from '../store';

export const MENU_SHEET = 'opciones';

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

export function useWizard<T>({ kind, step, actorId, store, initial, changed }: WizardOptions<T>) {
    const navigate = useNavigate();
    const location = useLocation();
    const snackbar = useSnackbar();
    const { canOpen, soon } = useOpenPath();
    const menu = useSheet(MENU_SHEET);
    const entry = store.useEntry(actorId);
    const saved = entry?.saved ?? false;

    const goTo = useCallback((n: number) => navigate(paths.publicar(kind, n), { replace: true }), [kind, navigate]);

    // Atrás (Android o el del AppBar): el paso anterior; en el paso 1 sigue el historial.
    useWizardBack(() => {
        if (step <= 1) return false;
        goTo(step - 1);
        return true;
    });

    // Solo al salir del asistente (paso 1) se pierde algo: en los demás, atrás es el paso anterior.
    useDirtyGuard(step === 1 && changed && !saved);

    // Volver con el borrador guardado: sigue desde el paso en que salió. Solo al abrir el asistente.
    const [resumeTo] = useState(() => (step === 1 && entry?.saved && entry.savedStep > 1 ? entry.savedStep : null));
    const resumed = useRef(false);
    useEffect(() => {
        if (!resumeTo || resumed.current) return;
        resumed.current = true;
        goTo(resumeTo);
    }, [resumeTo, goTo]);

    // Salir sin guardar (atrás con «Descartar», el atrás del navegador) borra lo escrito.
    useEffect(
        () => () => {
            if (store.get(actorId)?.saved === false) store.discard(actorId);
        },
        [actorId, store],
    );

    // La hoja de opciones la abrió la app (push): cerrarla es volver una entrada.
    const menuPushed = menu.open && (location.state as { sheet?: string } | null)?.sheet === MENU_SHEET;

    /** Deja el asistente: vuelve a la pantalla de antes (sin la hoja de opciones) o, sin historial, a Inicio. */
    const leave = useCallback(() => {
        const back = menuPushed ? 2 : 1;
        if (historyIndex() >= back) navigate(-back);
        else navigate(paths.inicio(), { replace: true });
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

    return { goTo, menu, saveAndExit, help };
}
