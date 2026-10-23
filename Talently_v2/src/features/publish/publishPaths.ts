// Rutas del feature, armadas sobre src/app/paths.ts.
import { paths } from '../../app/paths';
import type { WizardKind } from './model/publisher';

/** PUBL-07 · Publicación enviada. */
export const publishedPath = (kind: WizardKind): string => paths.publicado(kind);

/** VER-02 con la pantalla a la que vuelve al terminar (PUBL-04-identidad → VER-02 → PUBL-07). */
export const identityPath = (volver: string): string => paths.verificarIdentidad(volver);
