// Estado local de la demostración: lo que la persona edita en su perfil y el
// «Avisarme» de PRF-12. Vive en memoria mientras la app está abierta (como la
// memoria de pestañas): al volver a Perfil, los cambios siguen ahí. Cuando
// vuelva Supabase, esto se reemplaza por las escrituras reales.
import { useCallback, useState } from 'react';
import { getProfile } from '../demo/data';
import type { DemoActorId, DemoProfile } from '../demo/types';

const edited = new Map<DemoActorId, DemoProfile>();
const boostNotify = new Set<DemoActorId>();

/** El perfil del actor con sus ediciones de esta sesión. */
export function useEditableProfile(actorId: DemoActorId): [DemoProfile, (next: DemoProfile) => void] {
    const [profile, setProfile] = useState<DemoProfile>(() => edited.get(actorId) ?? getProfile(actorId));
    const save = useCallback(
        (next: DemoProfile) => {
            edited.set(actorId, next);
            setProfile(next);
        },
        [actorId],
    );
    return [profile, save];
}

/** PRF-12: ¿ya pidió que le avisemos? */
export function useBoostNotify(actorId: DemoActorId): [boolean, () => void] {
    const [on, setOn] = useState(() => boostNotify.has(actorId));
    const turnOn = useCallback(() => {
        boostNotify.add(actorId);
        setOn(true);
    }, [actorId]);
    return [on, turnOn];
}
