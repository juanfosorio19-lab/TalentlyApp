// Lo que Actividad lee de la sesión de demostración y features/demo aún no
// trae (pedido en requests: un demo/sessionState.ts con lo que hoy viven por
// separado home/inbox.ts, publications/store.ts y ./shiftStore.ts). Cuando
// llegue, este archivo se borra y Actividad lee de allá.
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { DemoActorId } from '../demo/session';

/**
 * ¿Viene del final del onboarding? `?demo=jorge&nuevo=1` (antes del #) o
 * `nuevo=1` en la ruta, igual que lo lee Inicio (home/inbox.ts).
 */
function useNuevoEnUrl(): boolean {
    const [hashSearch] = useSearchParams();
    // Lo de antes del # no cambia mientras la app está abierta: se lee una vez.
    const [fromLocation] = useState(() => new URLSearchParams(window.location.search).get('nuevo') === '1');
    return fromLocation || hashSearch.get('nuevo') === '1';
}

/**
 * Cuenta recién creada: Inicio vacío (INI-01-jorge-nuevo) y Actividad sin
 * postulaciones ni agenda (el TabBar del prototipo lleva a ACT-02-vacia). Los
 * datos solo traen esa variante para Jorge (getHomeFeed con recienRegistrado).
 */
export function useRecienRegistrado(actorId: DemoActorId): boolean {
    const nuevo = useNuevoEnUrl();
    return nuevo && actorId === 'jorge';
}
