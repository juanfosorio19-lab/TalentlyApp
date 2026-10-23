// El atrás del navegador (popstate: el gesto de volver en iOS o en la PWA)
// detenido mientras el asistente tiene algo que cuidar (spec §5.3 reglas 4 y
// 5): useBlocker lo revierte y `onBlocked` lo resuelve como el atrás de
// Android. Se monta solo cuando hace falta (paso > 1 o cambios sin guardar):
// el router admite un solo bloqueador y avisa en cada popstate que no creó.
import { useEffect } from 'react';
import { useBlocker, type BlockerFunction } from 'react-router-dom';

export interface BackGuard {
    active: boolean;
    shouldBlock: BlockerFunction;
    onBlocked: () => void;
}

export function BrowserBackGuard({ shouldBlock, onBlocked }: Omit<BackGuard, 'active'>) {
    const blocker = useBlocker(shouldBlock);
    useEffect(() => {
        if (blocker.state !== 'blocked') return;
        blocker.reset();
        onBlocked();
    }, [blocker, onBlocked]);
    return null;
}
