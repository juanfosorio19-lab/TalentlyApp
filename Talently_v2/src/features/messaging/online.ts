// ¿Hay conexión? MSG-02 muestra «Sin conexión…» y deja los mensajes nuevos en
// cola (demo/conversationState los envía solos al volver la conexión).
import { useSyncExternalStore } from 'react';

function subscribeOnline(listener: () => void): () => void {
    window.addEventListener('online', listener);
    window.addEventListener('offline', listener);
    return () => {
        window.removeEventListener('online', listener);
        window.removeEventListener('offline', listener);
    };
}

/** `false` sin conexión: Banner «Sin conexión…» y los mensajes nuevos quedan en cola. */
export function useOnline(): boolean {
    return useSyncExternalStore(
        subscribeOnline,
        () => navigator.onLine,
        () => true,
    );
}
