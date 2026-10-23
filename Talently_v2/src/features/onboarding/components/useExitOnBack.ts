// El atrás de Android en Bienvenida (la raíz fuera de la sesión): igual que en
// Inicio (paso 6 de BackButtonManager), el primer toque avisa «Presiona atrás
// otra vez para salir» y el segundo, antes de 2 s, cierra la app. Nunca vuelve
// a la sesión que se acaba de cerrar. BackButtonManager ya trata /bienvenida
// como Inicio, pero solo cuando no queda historial interno: esta pantalla lo
// asegura también si se llegó a Bienvenida con un push desde la sesión (el
// atrás no la reabre con navigate(-1)).
import { useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useSnackbar } from '../../../ui/Snackbar';

const EXIT_WINDOW_MS = 2000;
const EXIT_HINT = 'Presiona atrás otra vez para salir';

export function useExitOnBack(): () => void {
    const snackbar = useSnackbar();
    const lastHint = useRef(0);
    return useCallback(() => {
        const now = Date.now();
        if (now - lastHint.current < EXIT_WINDOW_MS && Capacitor.isNativePlatform()) {
            void import('@capacitor/app').then(({ App }) => App.exitApp());
            return;
        }
        lastHint.current = now;
        snackbar.show({ message: EXIT_HINT });
    }, [snackbar]);
}
