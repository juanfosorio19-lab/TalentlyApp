// Reglas del actor que usa más de una pantalla del feature.
import type { DemoActor } from '../demo/session';

/** PRF-12 es para quien trabaja (spec §5.4, actor T): sin empleo ni turnos no hay oficio que destacar. */
export function trabaja(actor: DemoActor): boolean {
    return actor.capabilities.some((c) => c === 'empleo' || c === 'turnos');
}

/*
 * Al cambiar de actor, la pestaña Perfil se vuelve a montar (routes.tsx, key)
 * y el selector que abrió SHT-ACTOR desaparece: el AppBar nuevo toma el foco
 * en su selector para que el lector de pantalla no lo pierda en <body>.
 */
let focusSelectorOnMount = false;

/** SHT-ACTOR lo pide justo antes de cambiar de actor. */
export function focusActorSelectorAfterSwitch(): void {
    focusSelectorOnMount = true;
}

/** El AppBar recién montado lo consulta una vez: `true` si viene de un cambio de actor. */
export function takeActorSelectorFocus(): boolean {
    const pending = focusSelectorOnMount;
    focusSelectorOnMount = false;
    return pending;
}
