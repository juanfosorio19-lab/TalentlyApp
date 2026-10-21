// Navegación de Actividad: la raíz de una pestaña reemplaza (spec §5.3 regla 1:
// cambiar de pestaña hace replace) y una pantalla apilada se abre con push
// (regla 2). Toda ruta sale de paths.ts (o de ./paths mientras falte allá).
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTabRoot } from '../../app/paths';

export function useGo(): (to: string) => void {
    const navigate = useNavigate();
    return useCallback(
        (to: string) => {
            const pathname = to.split('?')[0] ?? to;
            navigate(to, { replace: isTabRoot(pathname) });
        },
        [navigate],
    );
}
