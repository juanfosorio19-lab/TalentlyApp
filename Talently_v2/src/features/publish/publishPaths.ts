// Rutas propias del feature mientras paths.ts no las trae (pedidas en
// «requests»: `paths.publicado(tipo)` y `paths.verificarIdentidad(volver)`).
import { paths } from '../../app/paths';
import type { WizardKind } from './model/publisher';

/** PUBL-07 · Publicación enviada. */
export const publishedPath = (kind: WizardKind): string => `/publicar/${kind}/listo`;

/** VER-02 con la pantalla a la que vuelve al terminar (PUBL-04-identidad → VER-02 → PUBL-07). */
export const identityPath = (volver: string): string => `${paths.verificarIdentidad()}?volver=${encodeURIComponent(volver)}`;
