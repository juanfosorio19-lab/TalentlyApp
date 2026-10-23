// Rutas del registro y del onboarding: nombres cortos sobre src/app/paths.ts,
// sin escribir rutas sueltas en las pantallas.
import { paths } from '../../app/paths';
import type { Bloque, PasoTrabajo } from './model';

export const onbPaths = {
    bienvenida: () => paths.bienvenida(),
    registro: () => paths.registro(),
    /** AUTH-03 · Revisa tu correo (spec §5.4). */
    verificar: () => paths.verificarCorreo(),
    intencion: () => paths.onboarding('intencion'),
    datos: () => paths.onboarding('datos'),
    trabajo: (paso: PasoTrabajo) => paths.onboarding('trabajo', paso),
    listo: () => paths.onboarding('listo'),
    /** Primer paso de un bloque (`/onboarding/:bloque/1`). Solo Trabajo existe en la demostración. */
    bloque: (bloque: Bloque) => paths.onboarding(bloque, 1),
    /** EXP-01 en lista, como el prototipo (ONB-99 → EXP-01-lista). Explorar lee la vista en `empleo.vista`. */
    empleosEnLista: () => paths.explorar('empleo', { vista: 'lista' }),
    turnos: () => paths.explorar('turno'),
    inicio: () => paths.inicio(),
    ayuda: () => paths.ayuda(),
    terminos: () => paths.terminos(),
    privacidad: () => paths.privacidad(),
    // CFG-06 · Eliminar cuenta (spec §5.4: «Accesible también durante el onboarding») no existe en la
    // demostración: el menú ⋯ lo dice con un aviso (demo/copy.ts). Cuando exista, va paths.eliminarCuenta().
} as const;
