// Una hoja del Perfil pedida por la URL que no aplica al actor (SHT-ACTOR sin
// organización, editar o el CV sin esa sección, «Verificación de …» sin
// insignias) no se abre y sale de la URL, con su `s`, sin dejar historial: así
// TabMemory tampoco la recuerda. Lo usan PRF-01 y PRF-02 con su perfil abierto.
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { profileSheetApplies, type ProfileSheetContext } from './model';

export function useSheetGuard(ctx: ProfileSheetContext): void {
    const [params, setParams] = useSearchParams();
    const sheet = params.get('sheet');
    const stale = sheet !== null && !profileSheetApplies(sheet, params.get('s'), ctx);

    useEffect(() => {
        if (!stale) return;
        setParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.delete('sheet');
                next.delete('s');
                return next;
            },
            { replace: true, preventScrollReset: true },
        );
    }, [stale, setParams]);
}
