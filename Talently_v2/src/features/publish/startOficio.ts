// El oficio con que parte un asistente cuando se abre desde «¿Qué necesitas?»
// de Inicio (`/publicar/hogar/1?oficio=cuidador-infantil`). Se recuerda por
// actor y tipo mientras dura el borrador, así el paso 2 no lo pierde aunque su
// URL ya no traiga `?oficio`. Abrir el paso 1 sin `?oficio` y sin borrador lo
// olvida (el asistente vuelve a partir con su valor por defecto).
import { useSearchParams } from 'react-router-dom';
import type { DemoActorId } from '../demo/session';

const remembered = new Map<string, string>();

export function useStartOficio<T>(
    kind: 'turno' | 'hogar',
    actorId: DemoActorId,
    step: number,
    hasDraft: boolean,
    isValid: (value: string) => value is T & string,
): T | null {
    const [params] = useSearchParams();
    const key = `${actorId}:${kind}`;
    const fromUrl = params.get('oficio');
    if (fromUrl && isValid(fromUrl)) {
        remembered.set(key, fromUrl);
    } else if (step === 1 && !hasDraft) {
        remembered.delete(key);
    }
    const value = remembered.get(key);
    return value !== undefined && isValid(value) ? value : null;
}
