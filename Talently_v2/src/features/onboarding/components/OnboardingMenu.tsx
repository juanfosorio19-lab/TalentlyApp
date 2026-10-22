// Menú ⋯ del registro (spec §6.1 regla 7 y StepLayout/README.md): una hoja
// con «Guardar y salir», «Ayuda», «Cerrar sesión» y «Eliminar cuenta»
// (`?sheet=opciones`), y el diálogo «¿Salir del registro?» del atrás en el
// primer paso. En el registro nada se descarta: se guarda lo que lleva.
import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { useSheet } from '../../../app/sheets';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Dialog } from '../../../ui/Dialog';
import { List, ListItem } from '../../../ui/ListItem';
import { COPY } from '../copy';
import { useFlow } from '../flow';
import { onbPaths } from '../paths';
import { setRetomar } from '../store';

export const MENU_SHEET = 'opciones';

/**
 * Salir del registro guardando lo que lleva (se retoma desde «Ya tengo
 * cuenta»), sin dejar los pasos en el historial (04-perfiles-y-onboarding.md
 * §5.5). «Guardar y salir» cierra la app en Android y en la web vuelve a
 * Bienvenida; «Cerrar sesión» (`closeApp` false) siempre vuelve a Bienvenida.
 */
export function useSaveAndExit(): (closeApp?: boolean) => void {
    const { pathname } = useLocation();
    const { leave } = useFlow();
    return useCallback(
        (closeApp = true) => {
            setRetomar(pathname);
            if (closeApp && Capacitor.isNativePlatform()) {
                void import('@capacitor/app').then(({ App }) => App.exitApp());
                return;
            }
            leave(onbPaths.bienvenida());
        },
        [leave, pathname],
    );
}

export function OnboardingMenu() {
    const sheet = useSheet(MENU_SHEET);
    const navigate = useNavigate();
    const { canOpen, soon } = useOpenPath();
    const saveAndExit = useSaveAndExit();
    const [logout, setLogout] = useState(false);
    // La pregunta «¿Cerrar sesión?» parte cerrada cada vez que se abre la hoja
    // (también si la hoja se cerró con el atrás del navegador).
    const [wasOpen, setWasOpen] = useState(sheet.open);
    if (sheet.open !== wasOpen) {
        setWasOpen(sheet.open);
        if (sheet.open) setLogout(false);
    }

    // Ayuda y Eliminar cuenta reemplazan la entrada de la hoja: atrás vuelve al paso, sin la hoja.
    const openInstead = (path: string) => {
        if (canOpen(path)) navigate(path, { replace: true });
        else soon();
    };

    return (
        <>
            <BottomSheet open={sheet.open} onClose={sheet.hide} title={COPY.menu.titulo}>
                <List flat className="onb-sheet-list">
                    <ListItem title={COPY.menu.guardarSalir} onClick={() => saveAndExit()} />
                    <ListItem title={COPY.menu.ayuda} chevron onClick={() => openInstead(onbPaths.ayuda())} />
                    <ListItem title={COPY.menu.cerrarSesion} onClick={() => setLogout(true)} />
                    <ListItem title={COPY.menu.eliminar} danger onClick={() => openInstead(onbPaths.eliminarCuenta())} />
                </List>
            </BottomSheet>
            <Dialog
                open={logout && sheet.open}
                onClose={() => setLogout(false)}
                title={COPY.menu.cerrarTitulo}
                confirmLabel={COPY.menu.cerrarSesion}
                destructive
                onConfirm={() => {
                    setLogout(false);
                    saveAndExit(false);
                }}
            >
                {COPY.menu.cerrarTexto}
            </Dialog>
        </>
    );
}

export interface ExitDialogProps {
    open: boolean;
    onClose: () => void;
}

/** «¿Salir del registro? Guardaremos lo que llevas» con «Seguir» / «Guardar y salir». */
export function ExitDialog({ open, onClose }: ExitDialogProps) {
    const saveAndExit = useSaveAndExit();
    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={COPY.salir.titulo}
            cancelLabel={COPY.salir.seguir}
            confirmLabel={COPY.salir.guardarSalir}
            onConfirm={() => {
                onClose();
                saveAndExit();
            }}
        >
            {COPY.salir.texto}
        </Dialog>
    );
}
