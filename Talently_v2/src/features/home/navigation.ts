// Navegación de «Inicio y notificaciones» sobre la base compartida: toda ruta
// sale de paths.ts o de demo/targets y se abre con useOpenPath (si la
// pantalla aún no existe, «Disponible pronto» en vez de SYS-404).
import { useCallback } from 'react';
import type { NavigateOptions } from 'react-router-dom';
import { useOpenPath, type LinkTargetProps } from '../../app/navigation/useOpenPath';
import { paths } from '../../app/paths';
import { useDemoSession } from '../demo/session';
import { targetPath } from '../demo/targets';
import type { DemoTarget } from '../demo/types';

/** `/perfil?sheet=cv`: Perfil con la hoja «Subir CV» abierta (la tarjeta «Te falta 1 cosa · Subir CV en PDF» de Inicio). */
export const profileCvPath = () => paths.perfil('cv');

export function useHomeNavigation() {
    const { actor } = useDemoSession();
    const { open, linkProps, soon, canOpen } = useOpenPath();

    // Ir a la raíz de otra pestaña hace replace (spec §5.3 regla 1) y a una pantalla apilada, push
    // (regla 2): lo decide useOpenPath, que además deja Inicio debajo al salir de él (paso 5 en la web).
    const go = useCallback((path: string, options?: NavigateOptions) => open(path, options), [open]);
    const link = useCallback((path: string): LinkTargetProps => linkProps(path), [linkProps]);

    /** Un destino de los datos (DemoTarget) como enlace: `href` real o, si no tiene pantalla, «Disponible pronto». */
    const targetLink = useCallback(
        (target: DemoTarget | undefined): LinkTargetProps => (target ? link(targetPath(target, actor.id)) : { onClick: soon }),
        [actor.id, link, soon],
    );

    const openTarget = useCallback(
        (target: DemoTarget | undefined) => (target ? go(targetPath(target, actor.id)) : soon()),
        [actor.id, go, soon],
    );

    return { go, link, targetLink, openTarget, soon, canOpen };
}

// El foco al cambiar de pantalla (volver de NOT-01 con otro actor, abrir NOT-01 desde la campana)
// lo rescata RootLayout para todas las pantallas: src/app/navigation/focus.ts.
