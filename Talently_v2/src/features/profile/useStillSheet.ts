// useSheet de src/app/sheets.ts sin mover la pantalla de abajo. En /perfil
// (raíz de pestaña) RootLayout guarda el scroll por ruta y búsqueda, así que
// `/perfil?sheet=cv` tiene el suyo: al volver a abrir la misma hoja desde otra
// altura (el CV desde «Te falta 1 cosa» y después desde su tarjeta),
// ScrollRestoration llevaba el perfil a donde estaba la vez anterior, detrás
// del velo. Esto lo deja donde se abrió. Pedido en «requests» que la clave de
// scroll ignore `?sheet=` y sus parámetros; ese día este archivo se borra y
// se usa useSheet directo.
import { useCallback, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSheet, type UrlSheet } from '../../app/sheets';

export function useStillSheet(name: string, params?: readonly string[]): UrlSheet {
    const sheet = useSheet(name, params);
    const { key } = useLocation();
    const openedAt = useRef<number | null>(null);

    useLayoutEffect(() => {
        const y = openedAt.current;
        if (!sheet.open || y === null) return;
        openedAt.current = null;
        // ScrollRestoration corre después en este mismo commit: se corrige antes del próximo cuadro.
        requestAnimationFrame(() => {
            if (window.scrollY !== y) window.scrollTo(0, y);
        });
    }, [sheet.open, key]);

    const { show: showSheet } = sheet;
    const show = useCallback(
        (params?: Record<string, string>) => {
            openedAt.current = window.scrollY;
            showSheet(params);
        },
        [showSheet],
    );

    return { ...sheet, show };
}
